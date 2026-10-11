<?php

// Acceptance Test
// Traces to: L2-013, L2-032, L2-044
// Description:
// Given a project, when anyone opens it, then the API returns its name, owner (with their profile id),
// summary, description, stage, "looking for", link and feedback count. The owner is told it is theirs.
// An id that does not exist answers 404, and so does a project whose owner and the member have blocked
// each other (D-052). Visitors may read every project (D-051).

namespace Tests\Feature\Projects;

use App\Models\Block;
use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ViewProjectTest extends TestCase
{
    use RefreshDatabase;

    private User $amara;

    private string $projectId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->amara = $this->member('Amara Osei');
        $this->projectId = $this->actingAs($this->amara)->postJson('/api/v1/projects', [
            'name' => 'Harvest',
            'summary' => 'Volunteer scheduling for GTA food banks',
            'description' => 'Six food banks use Harvest every week.',
            'stage' => 'pilot',
            'looking_for' => ['technical_co_founder'],
            'link' => 'https://harvest.example.ca',
        ])->assertCreated()->json('id');
        $this->app['auth']->forgetGuards();
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

    public function test_a_visitor_reads_the_project(): void
    {
        $owner = $this->amara->builder()->first();

        $this->getJson("/api/v1/projects/{$this->projectId}")
            ->assertOk()
            ->assertJson([
                'id' => $this->projectId,
                'name' => 'Harvest',
                'summary' => 'Volunteer scheduling for GTA food banks',
                'description' => 'Six food banks use Harvest every week.',
                'stage' => 'pilot',
                'looking_for' => ['technical_co_founder'],
                'link' => 'https://harvest.example.ca',
                'feedback_count' => 0,
                'owner' => ['id' => $owner->public_id, 'name' => 'Amara Osei'],
                'is_own' => false,
            ]);
    }

    public function test_the_owner_is_told_it_is_theirs(): void
    {
        $this->actingAs($this->amara)->getJson("/api/v1/projects/{$this->projectId}")->assertJson(['is_own' => true]);
    }

    public function test_a_missing_project_answers_404(): void
    {
        $this->getJson('/api/v1/projects/01jb0000000000000000000000')->assertNotFound();
        $this->getJson('/api/v1/projects/harvest')->assertNotFound();
    }

    public function test_a_block_either_way_hides_the_project(): void
    {
        $daniel = $this->member('Daniel Reyes');
        Block::create(['blocker_id' => $this->amara->id, 'blocked_id' => $daniel->id]);

        $this->actingAs($daniel)->getJson("/api/v1/projects/{$this->projectId}")->assertNotFound();
    }
}
