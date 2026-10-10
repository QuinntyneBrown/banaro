<?php

// Acceptance Test
// Traces to: L2-006, L2-002, L2-044
// Description: A verified member works through three onboarding steps (about, skills, goals). Each
// step saves on its own and survives leaving; role and neighbourhood are required; up to 12 skills
// are kept in order; the open-to choices are stored; finishing marks the profile complete. Only a
// verified member's own profile is touched, and an unverified member is refused.

namespace Tests\Feature\Profiles;

use App\Models\Neighbourhood;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    private User $member;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->member = User::factory()->create(['name' => 'Amara Osei']);
    }

    private function leslieville(): int
    {
        return Neighbourhood::where('slug', 'leslieville')->value('id');
    }

    private function about(array $overrides = [])
    {
        return $this->actingAs($this->member, 'web')->putJson('/api/v1/me/onboarding/about', array_merge([
            'name' => 'Amara Osei',
            'neighbourhood_id' => $this->leslieville(),
            'role' => 'founder',
        ], $overrides));
    }

    private function skills(array $skills)
    {
        return $this->actingAs($this->member, 'web')->putJson('/api/v1/me/onboarding/skills', ['skills' => $skills]);
    }

    private function goals(array $body)
    {
        return $this->actingAs($this->member, 'web')->putJson('/api/v1/me/onboarding/goals', $body);
    }

    private function progress()
    {
        return $this->actingAs($this->member, 'web')->getJson('/api/v1/me/onboarding');
    }

    public function test_a_new_member_starts_on_the_about_step_with_the_lists_to_choose_from(): void
    {
        $this->progress()
            ->assertOk()
            ->assertJsonPath('next_step', 'about')
            ->assertJsonPath('completed', false)
            ->assertJsonPath('about.name', 'Amara Osei')
            ->assertJsonPath('roles', ['founder', 'engineer', 'designer', 'product_manager', 'other'])
            ->assertJsonCount(12, 'skill_catalogue')
            ->assertJsonPath('skill_catalogue.0.name', 'React')
            ->assertJsonFragment(['name' => 'Leslieville', 'area' => 'Downtown Toronto']);
    }

    public function test_a_visitor_is_refused_and_an_unverified_member_is_told_to_verify(): void
    {
        $this->getJson('/api/v1/me/onboarding')->assertUnauthorized();

        $unverified = User::factory()->unverified()->create();
        $this->actingAs($unverified, 'web')
            ->getJson('/api/v1/me/onboarding')
            ->assertForbidden()
            ->assertJsonPath('code', 'email_unverified');
    }

    public function test_role_and_neighbourhood_are_required_and_nothing_is_saved_without_them(): void
    {
        $this->about(['role' => null, 'neighbourhood_id' => null])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['role', 'neighbourhood_id']);

        $this->progress()->assertJsonPath('next_step', 'about');
    }

    public function test_an_unknown_neighbourhood_or_role_is_refused(): void
    {
        $this->about(['neighbourhood_id' => 999999, 'role' => 'astronaut'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['neighbourhood_id', 'role']);
    }

    public function test_the_about_step_saves_and_moves_on_to_skills(): void
    {
        $this->about(['name' => 'Amara K. Osei'])->assertOk()->assertJsonPath('next_step', 'skills');

        $builder = $this->member->fresh()->builder;
        $this->assertSame('Amara K. Osei', $builder->name);
        $this->assertSame('founder', $builder->role->value);
        $this->assertSame($this->leslieville(), $builder->neighbourhood_id);
        $this->assertSame('Amara K. Osei', $this->member->fresh()->name);
    }

    public function test_fields_outside_the_step_are_ignored(): void
    {
        $other = User::factory()->create();

        $this->about(['user_id' => $other->id, 'onboarding_completed_at' => now()->toIso8601String()])->assertOk();

        $builder = $this->member->fresh()->builder;
        $this->assertSame($this->member->id, $builder->user_id);
        $this->assertNull($builder->onboarding_completed_at);
        $this->assertNull($other->fresh()->builder);
    }

    public function test_up_to_12_skills_are_kept_in_order_mixing_catalogue_and_custom(): void
    {
        $this->about();
        $react = Skill::where('slug', 'react')->value('id');
        $figma = Skill::where('slug', 'figma')->value('id');

        $this->skills([['name' => 'Rust'], ['id' => $figma], ['id' => $react], ['name' => 'rust']])
            ->assertOk()
            ->assertJsonPath('next_step', 'goals')
            ->assertJsonPath('skills.*.name', ['Rust', 'Figma', 'React']);
    }

    public function test_a_13th_skill_is_refused_with_an_explanation(): void
    {
        $this->about();
        $thirteen = array_map(fn ($i) => ['name' => "Skill {$i}"], range(1, 13));

        $this->skills($thirteen)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['skills' => 'Choose up to 12 skills. Remove one to add another.']);
    }

    public function test_the_goals_step_saves_the_open_to_choices(): void
    {
        $this->about();
        $this->skills([]);

        $this->goals(['open_to' => ['co_founding', 'advising'], 'building' => 'Harvest, volunteer scheduling for GTA food banks.'])
            ->assertOk()
            ->assertJsonPath('next_step', 'finish')
            ->assertJsonPath('goals.open_to', ['co_founding', 'advising'])
            ->assertJsonPath('goals.building', 'Harvest, volunteer scheduling for GTA food banks.');

        $this->goals(['open_to' => ['lurking']])->assertStatus(422)->assertJsonValidationErrors(['open_to.0']);
    }

    public function test_saved_steps_survive_leaving_and_coming_back(): void
    {
        $this->about();

        $this->progress()
            ->assertJsonPath('next_step', 'skills')
            ->assertJsonPath('about.role', 'founder')
            ->assertJsonPath('about.neighbourhood_id', $this->leslieville());
    }

    public function test_finishing_before_every_step_is_saved_names_the_missing_step(): void
    {
        $this->about();

        $this->actingAs($this->member, 'web')
            ->postJson('/api/v1/me/onboarding/complete')
            ->assertStatus(422)
            ->assertJsonPath('code', 'onboarding_incomplete')
            ->assertJsonPath('next_step', 'skills');
    }

    public function test_finishing_marks_the_profile_complete_once(): void
    {
        $this->about();
        $this->skills([]);
        $this->goals(['open_to' => ['contributing']]);

        $this->actingAs($this->member, 'web')->postJson('/api/v1/me/onboarding/complete')
            ->assertOk()
            ->assertJsonPath('completed', true);
        $completedAt = $this->member->fresh()->builder->onboarding_completed_at;
        $this->assertNotNull($completedAt);

        $this->actingAs($this->member, 'web')->postJson('/api/v1/me/onboarding/complete')->assertOk();
        $this->assertEquals($completedAt, $this->member->fresh()->builder->onboarding_completed_at);
    }

    public function test_the_session_reports_onboarding_and_the_public_profile_id(): void
    {
        $this->actingAs($this->member, 'web')->getJson('/api/v1/session')
            ->assertJsonPath('member.onboarding_complete', false)
            ->assertJsonPath('member.builder_id', null);

        $this->about();
        $this->skills([]);
        $this->goals(['open_to' => []]);
        $this->actingAs($this->member, 'web')->postJson('/api/v1/me/onboarding/complete');

        $session = $this->actingAs($this->member, 'web')->getJson('/api/v1/session');
        $session->assertJsonPath('member.onboarding_complete', true);
        $this->assertSame($this->member->fresh()->builder->public_id, $session->json('member.builder_id'));
        $this->assertMatchesRegularExpression('/^[0-9a-hjkmnp-tv-z]{26}$/', $session->json('member.builder_id'));
    }
}
