<?php

// Acceptance Test
// Traces to: L2-017, L2-029, L2-044
// Description:
// Given a project that is looking for roles, when a member who is not its owner offers help in one of
// those roles with a message of 10 to 1,000 characters, then the offer is recorded as pending and the
// owner is notified. A role the project is not looking for, or a bad message, is refused with 422 and
// nothing is recorded. A second open offer from the same member answers 409 offer_pending. The owner
// and a blocked pair are refused with 403. Only the owner lists a project's offers, open ones first;
// everyone else gets 404.

namespace Tests\Feature\Projects;

use App\Enums\LookingForRole;
use App\Models\Block;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CreatesMembers;
use Tests\TestCase;

class OfferToHelpTest extends TestCase
{
    use CreatesMembers;
    use RefreshDatabase;

    private const MESSAGE = 'I can review the Laravel code on weekends and help with tests.';

    private function lookingProject(User $owner, array $roles = ['contributor', 'advisor']): Project
    {
        $project = $this->project($owner, 'Psalter');
        $project->setLookingFor($roles);

        return $project;
    }

    private function offer(Project $project, User $as, string $role = 'contributor', string $message = self::MESSAGE)
    {
        return $this->actingAs($as)->postJson("/api/v1/projects/{$project->public_id}/help-offers", [
            'role' => $role,
            'message' => $message,
        ]);
    }

    public function test_an_offer_for_a_looking_for_role_is_recorded_and_the_owner_is_notified(): void
    {
        $owner = $this->member('Daniel Reyes');
        $project = $this->lookingProject($owner);
        $helper = $this->member('Amara Osei');

        $this->offer($project, $helper)
            ->assertCreated()
            ->assertJsonPath('role', 'contributor')
            ->assertJsonPath('message', self::MESSAGE)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('offerer.name', 'Amara Osei')
            ->assertJsonPath('conversation_id', null);

        $notification = $owner->notifications()->sole();
        $this->assertSame('help_offered', $notification->data['kind']);
        $this->assertEquals(['type' => 'project', 'id' => $project->public_id], $notification->data['subject']);
        $this->assertSame(1, $project->helpOffers()->count());
    }

    public function test_a_role_the_project_is_not_looking_for_or_a_bad_message_answers_422(): void
    {
        $project = $this->lookingProject($this->member('Owner'), ['contributor']);
        $helper = $this->member('Helper');

        $this->offer($project, $helper, 'designer')->assertStatus(422)->assertJsonValidationErrors('role');
        $this->offer($project, $helper, 'nonsense')->assertStatus(422)->assertJsonValidationErrors('role');
        $this->offer($project, $helper, 'contributor', 'Too short')->assertStatus(422)->assertJsonValidationErrors('message');
        $this->offer($project, $helper, 'contributor', str_repeat('a', 1001))->assertStatus(422)->assertJsonValidationErrors('message');
        $this->actingAs($helper)->postJson("/api/v1/projects/{$project->public_id}/help-offers", [])
            ->assertStatus(422)->assertJsonValidationErrors(['role', 'message']);

        $this->assertSame(0, $project->helpOffers()->count());
    }

    public function test_a_second_open_offer_answers_409_offer_pending(): void
    {
        $project = $this->lookingProject($this->member('Owner'));
        $helper = $this->member('Helper');
        $this->offer($project, $helper)->assertCreated();

        $this->offer($project, $helper, 'advisor')
            ->assertStatus(409)
            ->assertJsonPath('code', 'offer_pending');

        $this->assertSame(1, $project->helpOffers()->count());
        $this->offer($project, $this->member('Another helper'))->assertCreated();
    }

    public function test_the_owner_and_a_blocked_pair_cannot_offer(): void
    {
        $owner = $this->member('Owner');
        $project = $this->lookingProject($owner);
        $blocked = $this->member('Blocked');
        $blocker = $this->member('Blocker');
        Block::create(['blocker_id' => $owner->id, 'blocked_id' => $blocked->id]);
        Block::create(['blocker_id' => $blocker->id, 'blocked_id' => $owner->id]);

        $this->offer($project, $owner)->assertForbidden()->assertJsonPath('code', 'offer_not_allowed');
        $this->offer($project, $blocked)->assertForbidden();
        $this->offer($project, $blocker)->assertForbidden();

        $this->assertSame(0, $project->helpOffers()->count());
    }

    public function test_only_the_owner_lists_offers_open_ones_first_and_others_get_404(): void
    {
        $owner = $this->member('Daniel Reyes');
        $project = $this->lookingProject($owner);
        Carbon::setTestNow('2026-10-12 09:00');
        $this->offer($project, $this->member('First Helper'))->assertCreated();
        Carbon::setTestNow('2026-10-12 10:00');
        $this->offer($project, $this->member('Second Helper'), 'advisor')->assertCreated();
        $project->helpOffers()->whereHas('offerer', fn ($q) => $q->where('name', 'Second Helper'))
            ->update(['status' => 'declined']);

        $list = $this->actingAs($owner)->getJson("/api/v1/projects/{$project->public_id}/help-offers")->assertOk();

        $list->assertJsonPath('total', 2);
        $this->assertSame(['First Helper', 'Second Helper'], array_column(array_column($list->json('items'), 'offerer'), 'name'));
        $this->assertSame(['pending', 'declined'], array_column($list->json('items'), 'status'));

        $this->actingAs($this->member('Stranger'))->getJson("/api/v1/projects/{$project->public_id}/help-offers")->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/projects/{$project->public_id}/help-offers")->assertUnauthorized();
    }

    public function test_offers_need_a_signed_in_verified_member_and_an_existing_project(): void
    {
        $project = $this->lookingProject($this->member('Owner'));

        $this->postJson("/api/v1/projects/{$project->public_id}/help-offers", ['role' => 'contributor', 'message' => self::MESSAGE])
            ->assertUnauthorized();
        $this->offer($project, User::factory()->unverified()->create())->assertForbidden();
        $this->actingAs($this->member('Helper'))
            ->postJson('/api/v1/projects/'.str_repeat('a', 26).'/help-offers', ['role' => 'contributor', 'message' => self::MESSAGE])
            ->assertNotFound();
        $this->assertContains('contributor', array_map(fn ($case) => $case->value, LookingForRole::cases()));
    }
}
