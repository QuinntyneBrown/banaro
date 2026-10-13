<?php

// Acceptance Test
// Traces to: L2-016, L2-029, L2-044, L2-046
// Description:
// Given a project, when a member who is not its owner posts feedback of 10 to 1,000 characters, then
// it appears at the top of the project's feedback list with its author and time, the project's
// feedback count rises and the owner is notified. Feedback outside the limits is refused with 422 and
// nothing is posted. The owner cannot give feedback on their own project, and neither can a member in a
// blocked pair with the owner (403). A member who posts more than 10 pieces in an hour gets 429. The
// list is public, five at a time, and leaves out feedback from a member the viewer has blocked.

namespace Tests\Feature\Projects;

use App\Models\Block;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CreatesMembers;
use Tests\TestCase;

class GiveFeedbackTest extends TestCase
{
    use CreatesMembers;
    use RefreshDatabase;

    private const GOOD = 'The review queue is lovely. Could the streak count be optional?';

    private function give(string $project, $as, string $body = self::GOOD)
    {
        return $this->actingAs($as)->postJson("/api/v1/projects/{$project}/feedback", ['body' => $body]);
    }

    public function test_feedback_appears_at_the_top_raises_the_count_and_notifies_the_owner(): void
    {
        $owner = $this->member('Daniel Reyes');
        $project = $this->project($owner, 'Psalter');
        $first = $this->member('Hannah Kowalski');
        $second = $this->member('Noah Fischer');

        Carbon::setTestNow('2026-10-12 09:00');
        $this->give($project->public_id, $first, 'What happens when someone misses a week of reviews?')
            ->assertCreated()
            ->assertJsonPath('body', 'What happens when someone misses a week of reviews?')
            ->assertJsonPath('author.name', 'Hannah Kowalski');
        Carbon::setTestNow('2026-10-12 10:00');
        $this->give($project->public_id, $second)->assertCreated();

        $list = $this->getJson("/api/v1/projects/{$project->public_id}/feedback")->assertOk();
        $list->assertJsonPath('total', 2)->assertJsonPath('per_page', 5);
        $this->assertSame(['Noah Fischer', 'Hannah Kowalski'], array_column(array_column($list->json('items'), 'author'), 'name'));
        $this->assertArrayHasKey('created_at', $list->json('items.0'));
        $this->assertSame(2, $project->fresh()->feedback_count);
        $this->assertTrue($project->fresh()->last_activity_at->equalTo(Carbon::parse('2026-10-12 10:00')));

        $notifications = $owner->notifications()->get();
        $this->assertCount(2, $notifications);
        $this->assertSame('feedback_received', $notifications->first()->data['kind']);
        $this->assertEquals(['type' => 'project', 'id' => $project->public_id], $notifications->first()->data['subject']);
    }

    public function test_feedback_outside_10_to_1000_characters_answers_422_and_posts_nothing(): void
    {
        $project = $this->project($this->member('Owner'));
        $author = $this->member('Author');

        foreach (['', 'Too short', str_repeat('a', 1001)] as $body) {
            $this->give($project->public_id, $author, $body)->assertStatus(422)->assertJsonValidationErrors('body');
        }
        $this->give($project->public_id, $author, str_repeat('a', 1000))->assertCreated();

        $this->assertSame(1, $project->fresh()->feedback_count);
    }

    public function test_the_owner_cannot_give_feedback_on_their_own_project(): void
    {
        $owner = $this->member('Owner');
        $project = $this->project($owner);

        $this->give($project->public_id, $owner)->assertForbidden()->assertJsonPath('code', 'feedback_not_allowed');

        $this->assertSame(0, $project->fresh()->feedback_count);
    }

    public function test_a_blocked_pair_cannot_give_feedback_either_way(): void
    {
        $owner = $this->member('Owner');
        $project = $this->project($owner);
        $blocked = $this->member('Blocked');
        $blocker = $this->member('Blocker');
        Block::create(['blocker_id' => $owner->id, 'blocked_id' => $blocked->id]);
        Block::create(['blocker_id' => $blocker->id, 'blocked_id' => $owner->id]);

        $this->give($project->public_id, $blocked)->assertForbidden();
        $this->give($project->public_id, $blocker)->assertForbidden();

        $this->assertSame(0, $project->fresh()->feedback_count);
    }

    public function test_the_eleventh_piece_in_an_hour_answers_429(): void
    {
        $owner = $this->member('Owner');
        $author = $this->member('Author');
        $projects = collect(range(1, 11))->map(fn (int $i) => $this->project($owner, "Project {$i}"));

        foreach ($projects->take(10) as $project) {
            $this->give($project->public_id, $author)->assertCreated();
        }

        $response = $this->give($projects->last()->public_id, $author)->assertStatus(429);
        $this->assertNotNull($response->headers->get('Retry-After'));
    }

    public function test_only_a_signed_in_verified_member_posts_and_a_missing_project_answers_404(): void
    {
        $project = $this->project($this->member('Owner'));

        $this->postJson("/api/v1/projects/{$project->public_id}/feedback", ['body' => self::GOOD])->assertUnauthorized();
        $this->give($project->public_id, User::factory()->unverified()->create())->assertForbidden();
        $this->give(str_repeat('a', 26), $this->member('Author'))->assertNotFound();
    }

    public function test_the_list_is_public_five_at_a_time_and_leaves_out_blocked_authors(): void
    {
        $owner = $this->member('Owner');
        $project = $this->project($owner);
        $viewer = $this->member('Viewer');
        $unwanted = $this->member('Unwanted Voice');
        Carbon::setTestNow('2026-10-12 08:00');
        $this->give($project->public_id, $unwanted, 'A comment the viewer would rather not see.')->assertCreated();
        foreach (range(1, 6) as $i) {
            Carbon::setTestNow(Carbon::parse('2026-10-12 09:00')->addMinutes($i));
            $this->give($project->public_id, $this->member("Author {$i}"), "Comment number {$i} on the project.")->assertCreated();
        }
        Block::create(['blocker_id' => $viewer->id, 'blocked_id' => $unwanted->id]);

        $visitor = $this->getJson("/api/v1/projects/{$project->public_id}/feedback")->assertOk();
        $this->assertCount(5, $visitor->json('items'));
        $visitor->assertJsonPath('total', 7)->assertJsonPath('last_page', 2);

        $member = $this->actingAs($viewer)->getJson("/api/v1/projects/{$project->public_id}/feedback?page=2")->assertOk();
        $member->assertJsonPath('total', 6);
        $this->assertSame([], array_values(array_filter(
            array_column(array_column($member->json('items'), 'author'), 'name'),
            fn (string $name) => $name === 'Unwanted Voice',
        )));
    }

    public function test_a_project_the_viewer_cannot_see_has_no_feedback_list(): void
    {
        $owner = $this->member('Owner');
        $project = $this->project($owner);
        $viewer = $this->member('Viewer');
        Block::create(['blocker_id' => $owner->id, 'blocked_id' => $viewer->id]);

        $this->actingAs($viewer)->getJson("/api/v1/projects/{$project->public_id}/feedback")->assertNotFound();
        $this->getJson('/api/v1/projects/'.str_repeat('a', 26).'/feedback')->assertNotFound();
        $this->assertInstanceOf(Project::class, $project);
    }
}
