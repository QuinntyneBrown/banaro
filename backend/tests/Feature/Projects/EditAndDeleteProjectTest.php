<?php

// Acceptance Test
// Traces to: L2-014, L2-044, L2-045
// Description:
// Given the owner, when they save valid changes, then the project updates, its activity is refreshed
// and the new values are returned; invalid values answer 422 and change nothing. Given a member who is
// not the owner, when they update or delete it, then the API answers 403 and nothing changes. Given
// the owner deletes it, then the project and its "looking for" roles are removed and it answers 404.

namespace Tests\Feature\Projects;

use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EditAndDeleteProjectTest extends TestCase
{
    use RefreshDatabase;

    private User $amara;

    private string $projectId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->amara = $this->member('Amara Osei');
        Carbon::setTestNow('2026-10-01 09:00:00');
        $this->projectId = $this->actingAs($this->amara)->postJson('/api/v1/projects', $this->project())
            ->assertCreated()->json('id');
        Carbon::setTestNow('2026-10-11 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
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
            'description' => null,
            'stage' => 'pilot',
            'looking_for' => ['technical_co_founder'],
            'link' => null,
        ], $overrides);
    }

    public function test_the_owner_saves_changes(): void
    {
        $this->actingAs($this->amara)->putJson("/api/v1/projects/{$this->projectId}", $this->project([
            'name' => 'Harvest Hands',
            'stage' => 'launched',
            'looking_for' => ['designer', 'advisor'],
            'link' => 'https://harvest.example.ca',
        ]))->assertOk()->assertJson([
            'name' => 'Harvest Hands',
            'stage' => 'launched',
            'looking_for' => ['advisor', 'designer'],
            'link' => 'https://harvest.example.ca',
        ]);

        $project = Project::where('public_id', $this->projectId)->firstOrFail();
        $this->assertSame('2026-10-11 12:00:00', $project->last_activity_at->format('Y-m-d H:i:s'));
    }

    public function test_invalid_changes_are_refused_and_change_nothing(): void
    {
        $this->actingAs($this->amara)->putJson("/api/v1/projects/{$this->projectId}", $this->project(['name' => '', 'link' => 'ftp://x']))
            ->assertStatus(422)->assertJsonValidationErrors(['name', 'link']);

        $this->assertSame('Harvest', Project::where('public_id', $this->projectId)->value('name'));
    }

    public function test_another_member_can_neither_edit_nor_delete(): void
    {
        $daniel = $this->member('Daniel Reyes');

        $this->actingAs($daniel)->putJson("/api/v1/projects/{$this->projectId}", $this->project(['name' => 'Taken']))->assertForbidden();
        $this->actingAs($daniel)->deleteJson("/api/v1/projects/{$this->projectId}")->assertForbidden();

        $this->assertSame('Harvest', Project::where('public_id', $this->projectId)->value('name'));
    }

    public function test_the_owner_deletes_the_project_and_its_roles(): void
    {
        $id = Project::where('public_id', $this->projectId)->value('id');

        $this->actingAs($this->amara)->deleteJson("/api/v1/projects/{$this->projectId}")->assertNoContent();

        $this->assertNull(Project::find($id));
        $this->assertSame(0, DB::table('project_looking_for')->where('project_id', $id)->count());
        $this->getJson("/api/v1/projects/{$this->projectId}")->assertNotFound();
    }

    public function test_editing_needs_a_signed_in_member(): void
    {
        $this->app['auth']->forgetGuards();
        $this->putJson("/api/v1/projects/{$this->projectId}", $this->project())->assertUnauthorized();
        $this->deleteJson("/api/v1/projects/{$this->projectId}")->assertUnauthorized();
    }
}
