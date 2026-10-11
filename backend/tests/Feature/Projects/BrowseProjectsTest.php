<?php

// Acceptance Test
// Traces to: L2-015, L2-032, L2-045
// Description:
// Given projects, when anyone browses them, then they are listed 12 per page with name, owner, summary,
// stage, "looking for" and feedback count, most recently active first. Search text, stages and roles
// narrow them: results match all filters, any value within a filter. A page past the end returns the
// last page. Projects of a member blocked either way are left out. Unknown values answer 422.

namespace Tests\Feature\Projects;

use App\Models\Block;
use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class BrowseProjectsTest extends TestCase
{
    use RefreshDatabase;

    private User $amara;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->amara = $this->member('Amara Osei');
    }

    private function member(string $name): User
    {
        $user = User::factory()->create(['name' => $name]);
        Builder::create([
            'user_id' => $user->id,
            'name' => $name,
            'role' => 'founder',
            'neighbourhood_id' => Neighbourhood::where('slug', 'leslieville')->value('id'),
            'open_to' => ['co_founding'],
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => now(),
        ]);

        return $user;
    }

    private function share(User $owner, string $name, string $stage, array $roles, string $activeAt, string $summary = 'A product in progress'): void
    {
        $id = $this->actingAs($owner)->postJson('/api/v1/projects', [
            'name' => $name, 'summary' => $summary, 'stage' => $stage, 'looking_for' => $roles,
        ])->assertCreated()->json('id');
        Project::where('public_id', $id)->update(['last_activity_at' => Carbon::parse($activeAt)]);
        $this->app['auth']->forgetGuards();
    }

    /** @return list<string> */
    private function names(array $query = [], ?User $as = null): array
    {
        if ($as === null) {
            // A visitor: drop whoever an earlier request in this test signed in as.
            $this->app['auth']->forgetGuards();
        }
        $request = $as ? $this->actingAs($as) : $this;

        return array_column($request->getJson('/api/v1/projects?'.http_build_query($query))->assertOk()->json('items'), 'name');
    }

    public function test_projects_are_listed_most_recently_active_first_with_their_card(): void
    {
        $this->share($this->amara, 'Harvest', 'pilot', ['technical_co_founder'], '2026-10-10');
        $this->share($this->amara, 'Psalter', 'beta', [], '2026-10-11');
        $owner = $this->amara->builder()->first();

        $response = $this->getJson('/api/v1/projects')->assertOk();

        $this->assertSame(['Psalter', 'Harvest'], array_column($response->json('items'), 'name'));
        $response->assertJson(['total' => 2, 'page' => 1, 'per_page' => 12, 'last_page' => 1]);
        $card = $response->json('items.1');
        $this->assertSame(['id', 'name', 'summary', 'stage', 'looking_for', 'feedback_count', 'owner'], array_keys($card));
        $this->assertSame(['id' => $owner->public_id, 'name' => 'Amara Osei'], $card['owner']);
        $this->assertSame(['technical_co_founder'], $card['looking_for']);
    }

    public function test_twelve_per_page_and_a_page_past_the_end_shows_the_last(): void
    {
        $daniel = $this->member('Daniel Reyes');
        for ($i = 1; $i <= 7; $i++) {
            $this->share($this->amara, "Amara {$i}", 'idea', [], "2026-10-0{$i}");
            $this->share($daniel, "Daniel {$i}", 'idea', [], "2026-09-0{$i}");
        }

        $first = $this->getJson('/api/v1/projects')->json();
        $this->assertCount(12, $first['items']);
        $this->getJson('/api/v1/projects?page=5')->assertJson(['page' => 2, 'last_page' => 2, 'total' => 14]);
    }

    public function test_search_stages_and_roles_narrow_the_list(): void
    {
        $this->share($this->amara, 'Harvest', 'pilot', ['technical_co_founder'], '2026-10-01', 'Volunteer scheduling for food banks');
        $this->share($this->amara, 'Psalter', 'beta', ['designer'], '2026-10-02', 'Scripture memory');
        $this->share($this->amara, 'Gather', 'idea', ['designer', 'advisor'], '2026-10-03', 'Small groups that meet');

        $this->assertSame(['Harvest'], $this->names(['q' => 'food']));
        $this->assertSame(['Psalter'], $this->names(['q' => 'psal']));
        $this->assertSame(['Psalter', 'Harvest'], $this->names(['stage' => ['pilot', 'beta']]));
        $this->assertSame(['Gather', 'Psalter'], $this->names(['looking_for' => ['designer']]));
        $this->assertSame(['Psalter'], $this->names(['stage' => ['beta', 'pilot'], 'looking_for' => ['designer']]));
        $this->assertSame([], $this->names(['q' => 'nothing like this']));
    }

    public function test_projects_of_a_member_blocked_either_way_are_left_out(): void
    {
        $daniel = $this->member('Daniel Reyes');
        $this->share($daniel, 'Daniel project', 'idea', [], '2026-10-01');
        $this->share($this->amara, 'Amara project', 'idea', [], '2026-10-02');
        Block::create(['blocker_id' => $daniel->id, 'blocked_id' => $this->amara->id]);

        $this->assertSame(['Amara project'], $this->names([], $this->amara));
        $this->assertSame(['Amara project', 'Daniel project'], $this->names());
    }

    public function test_unknown_values_are_refused(): void
    {
        $this->getJson('/api/v1/projects?stage[]=scaling')->assertStatus(422)->assertJsonValidationErrors('stage.0');
        $this->getJson('/api/v1/projects?looking_for[]=astronaut')->assertStatus(422)->assertJsonValidationErrors('looking_for.0');
        $this->getJson('/api/v1/projects?page=0')->assertStatus(422)->assertJsonValidationErrors('page');
    }
}
