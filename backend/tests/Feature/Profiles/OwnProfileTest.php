<?php

// Acceptance Test
// Traces to: L2-007, L2-044, L2-045
// Description: A member reads and replaces their own profile (name, headline, neighbourhood, bio,
// skills, experience, links, open-to, what they are looking for and what they are building). Invalid
// values answer 422 per field and change nothing; markup is stored as text; no route reaches another
// member's profile and fields outside the form are ignored.

namespace Tests\Feature\Profiles;

use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $member;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->member = $this->builderMember('Amara Osei');
    }

    private function builderMember(string $name): User
    {
        $user = User::factory()->create(['name' => $name]);
        Builder::create([
            'user_id' => $user->id,
            'name' => $name,
            'role' => 'founder',
            'neighbourhood_id' => $this->hood('leslieville'),
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => now(),
        ]);

        return $user;
    }

    private function hood(string $slug): int
    {
        return Neighbourhood::where('slug', $slug)->value('id');
    }

    /** @return array<string, mixed> */
    private function profile(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Amara Osei',
            'headline' => 'Founder and product lead',
            'neighbourhood_id' => $this->hood('riverdale'),
            'bio' => 'Building Harvest, volunteer scheduling for GTA food banks.',
            'skills' => [['name' => 'Product strategy'], ['name' => 'Rust']],
            'experience' => [
                ['title' => 'Founder', 'organization' => 'Harvest', 'started_on' => '2024-03-01', 'ended_on' => null],
                ['title' => 'Product manager', 'organization' => 'Shopify', 'started_on' => '2019-01-01', 'ended_on' => '2024-02-01'],
            ],
            'links' => [['label' => 'Harvest', 'url' => 'https://harvest.example.ca']],
            'open_to' => ['co_founding'],
            'looking_for' => 'A technical co-founder who loves boring, reliable software.',
            'building' => 'Harvest, volunteer scheduling for GTA food banks.',
        ], $overrides);
    }

    private function save(array $overrides = [])
    {
        return $this->actingAs($this->member, 'web')->putJson('/api/v1/me/profile', $this->profile($overrides));
    }

    public function test_a_member_reads_their_own_profile_with_the_neighbourhood_list(): void
    {
        $this->actingAs($this->member, 'web')->getJson('/api/v1/me/profile')
            ->assertOk()
            ->assertJsonPath('name', 'Amara Osei')
            ->assertJsonPath('neighbourhood_id', $this->hood('leslieville'))
            ->assertJsonPath('photo_url', null)
            ->assertJsonFragment(['name' => 'Riverdale']);
    }

    public function test_saving_replaces_the_profile_and_it_reads_back(): void
    {
        $this->save()->assertOk();

        $this->actingAs($this->member, 'web')->getJson('/api/v1/me/profile')
            ->assertJsonPath('headline', 'Founder and product lead')
            ->assertJsonPath('neighbourhood_id', $this->hood('riverdale'))
            ->assertJsonPath('skills.*.name', ['Product strategy', 'Rust'])
            ->assertJsonPath('experience.0.organization', 'Harvest')
            ->assertJsonPath('experience.1.ended_on', '2024-02-01')
            ->assertJsonPath('links.0.url', 'https://harvest.example.ca')
            ->assertJsonPath('open_to', ['co_founding'])
            ->assertJsonPath('looking_for', 'A technical co-founder who loves boring, reliable software.')
            ->assertJsonPath('building', 'Harvest, volunteer scheduling for GTA food banks.');
    }

    public function test_saving_again_replaces_experience_and_links_rather_than_adding(): void
    {
        $this->save()->assertOk();

        $this->save(['experience' => [], 'links' => []])->assertOk()
            ->assertJsonCount(0, 'experience')
            ->assertJsonCount(0, 'links');
    }

    public function test_invalid_values_answer_422_per_field_and_change_nothing(): void
    {
        $this->save([
            'name' => '',
            'bio' => str_repeat('a', 501),
            'neighbourhood_id' => 999999,
            'links' => [['label' => 'Site', 'url' => 'javascript:alert(1)']],
            'experience' => [['title' => 'Founder', 'started_on' => '2024-03-01', 'ended_on' => '2023-01-01']],
        ])->assertStatus(422)->assertJsonValidationErrors([
            'name',
            'bio' => 'Your bio is 501 characters. Shorten it to 500 or fewer.',
            'neighbourhood_id',
            'links.0.url',
            'experience.0.ended_on',
        ]);

        $this->assertSame($this->hood('leslieville'), $this->member->fresh()->builder->neighbourhood_id);
    }

    public function test_at_least_one_way_of_working_together_is_required(): void
    {
        $this->save(['open_to' => []])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['open_to' => 'Choose at least one way you are open to working with others.']);
    }

    public function test_more_than_12_skills_are_refused(): void
    {
        $this->save(['skills' => array_map(fn ($i) => ['name' => "Skill {$i}"], range(1, 13))])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['skills']);
    }

    public function test_markup_is_kept_as_text(): void
    {
        $this->save(['name' => '<b>Amara</b>', 'bio' => '<script>alert(1)</script>'])->assertOk();

        $builder = $this->member->fresh()->builder;
        $this->assertSame('<b>Amara</b>', $builder->name);
        $this->assertSame('<script>alert(1)</script>', $builder->bio);
    }

    public function test_only_the_members_own_profile_changes_and_extra_fields_are_ignored(): void
    {
        $other = $this->builderMember('Daniel Reyes');

        $this->save(['user_id' => $other->id, 'role' => 'engineer', 'onboarding_completed_at' => null])->assertOk();

        $this->assertSame('Daniel Reyes', $other->fresh()->builder->name);
        $this->assertSame('founder', $this->member->fresh()->builder->role->value);
        $this->assertNotNull($this->member->fresh()->builder->onboarding_completed_at);
    }

    public function test_a_member_without_a_finished_profile_is_sent_to_onboarding(): void
    {
        $newcomer = User::factory()->create();

        $this->actingAs($newcomer, 'web')->getJson('/api/v1/me/profile')
            ->assertStatus(409)
            ->assertJsonPath('code', 'onboarding_incomplete');
    }
}
