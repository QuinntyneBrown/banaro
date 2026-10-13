<?php

// Acceptance Test
// Traces to: L2-012, L2-044, L2-045
// Description:
// Given a member, when they share a project with a name (≤ 80), a one-line summary (≤ 140), an
// optional description (≤ 2,000), a stage, zero or more "looking for" roles and an optional http(s)
// link, then the project is created owned by them and returned with its id. A missing name, summary or
// stage, any value over its limit, an unknown stage or role, or a link that is not http(s) answers 422
// per field. A member who owns 10 projects gets 422 with code `project_limit`. An owner given in the
// body is ignored, and markup is stored as text.

namespace Tests\Feature\Projects;

use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShareProjectTest extends TestCase
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

    /** @return array<string, mixed> */
    private function project(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Harvest',
            'summary' => 'Volunteer scheduling for GTA food banks',
            'description' => 'Six food banks use Harvest every week.',
            'stage' => 'pilot',
            'looking_for' => ['technical_co_founder', 'designer'],
            'link' => 'https://harvest.example.ca',
        ], $overrides);
    }

    private function share(array $project, ?User $as = null)
    {
        return $this->actingAs($as ?? $this->amara)->postJson('/api/v1/projects', $project);
    }

    public function test_a_member_shares_a_project_they_then_own(): void
    {
        $response = $this->share($this->project());

        $response->assertCreated()->assertJson([
            'name' => 'Harvest',
            'summary' => 'Volunteer scheduling for GTA food banks',
            'description' => 'Six food banks use Harvest every week.',
            'stage' => 'pilot',
            'looking_for' => ['technical_co_founder', 'designer'],
            'link' => 'https://harvest.example.ca',
            'feedback_count' => 0,
            'owner' => ['name' => 'Amara Osei'],
            'is_own' => true,
        ]);
        $this->assertMatchesRegularExpression('/^[0-9a-z]{26}$/', $response->json('id'));
        $project = Project::where('public_id', $response->json('id'))->firstOrFail();
        $this->assertSame($this->amara->id, $project->owner_id);
        $this->assertNotNull($project->last_activity_at);
    }

    public function test_the_description_link_and_roles_may_be_left_out(): void
    {
        $this->share($this->project(['description' => null, 'link' => null, 'looking_for' => []]))
            ->assertCreated()
            ->assertJson(['description' => null, 'link' => null, 'looking_for' => []]);
    }

    public function test_missing_and_overlong_values_are_refused_per_field(): void
    {
        $this->share(['looking_for' => []])->assertStatus(422)->assertJsonValidationErrors(['name', 'summary', 'stage']);
        $this->share($this->project([
            'name' => str_repeat('n', 81),
            'summary' => str_repeat('s', 141),
            'description' => str_repeat('d', 2001),
        ]))->assertStatus(422)->assertJsonValidationErrors(['name', 'summary', 'description']);
        $this->share($this->project(['stage' => 'scaling']))->assertStatus(422)->assertJsonValidationErrors('stage');
        $this->share($this->project(['looking_for' => ['astronaut']]))->assertStatus(422)->assertJsonValidationErrors('looking_for.0');
        $this->assertSame(0, Project::count());
    }

    public function test_only_http_and_https_links_are_accepted(): void
    {
        foreach (['javascript:alert(1)', 'ftp://harvest.example.ca', 'harvest.example.ca'] as $link) {
            $this->share($this->project(['link' => $link]))->assertStatus(422)->assertJsonValidationErrors('link');
        }
        $this->share($this->project(['link' => 'http://harvest.example.ca']))->assertCreated();
    }

    public function test_a_member_with_ten_projects_is_told_about_the_limit(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $this->share($this->project(['name' => "Project {$i}"]))->assertCreated();
        }

        $this->share($this->project(['name' => 'One more']))
            ->assertStatus(422)
            ->assertJson(['code' => 'project_limit']);
        $this->assertSame(10, Project::count());
    }

    public function test_an_owner_in_the_body_is_ignored_and_markup_stays_text(): void
    {
        $other = $this->member('Daniel Reyes');

        $response = $this->share($this->project(['owner_id' => $other->id, 'name' => '<b>Harvest</b>']))->assertCreated();

        $project = Project::where('public_id', $response->json('id'))->firstOrFail();
        $this->assertSame($this->amara->id, $project->owner_id);
        $this->assertSame('<b>Harvest</b>', $response->json('name'));
    }

    public function test_sharing_needs_a_signed_in_member(): void
    {
        $this->postJson('/api/v1/projects', $this->project())->assertUnauthorized();
    }
}
