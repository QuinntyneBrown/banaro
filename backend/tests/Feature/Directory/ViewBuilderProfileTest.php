<?php

// Acceptance Test
// Traces to: L2-011, L2-036, L2-044, L2-045
// Description:
// Given /builders/{id}, when a member opens another builder's profile, then the API returns photo,
// name, role, neighbourhood, distance, match score with its reasons, skills, bio, experience, what
// they are building, open to, last-seen status and member since, with the actions the member may take.
// A sparse profile carries only its populated fields. An id that does not exist, an unfinished
// profile, or a members-only profile opened by a visitor all answer the same 404. Hidden fields are
// absent: online status, the neighbourhood under "City only", and the e-mail address unless shown.
// A visitor gets the reduced profile. The member's own profile is marked as theirs.

namespace Tests\Feature\Directory;

use App\Models\Builder;
use App\Models\ExperienceEntry;
use App\Models\Neighbourhood;
use App\Models\PrivacySettings;
use App\Models\Skill;
use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ViewBuilderProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $viewer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        Carbon::setTestNow('2026-10-11 12:00:00');
        $this->viewer = $this->builder('Amara Osei', 'leslieville')->user;
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function builder(string $name, string $hood, array $extra = [], bool $complete = true): Builder
    {
        $user = User::factory()->create(['name' => $name, 'email' => strtolower(str_replace(' ', '.', $name)).'@harvest.example']);
        $builder = Builder::create(array_merge([
            'user_id' => $user->id,
            'name' => $name,
            'role' => 'engineer',
            'neighbourhood_id' => Neighbourhood::where('slug', $hood)->value('id'),
            'open_to' => ['co_founding'],
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => $complete ? now() : null,
            'last_active_at' => now()->subMinutes(2),
        ], $extra));
        $builder->forceFill(['created_at' => Carbon::parse('2026-03-14 10:00:00')])->save();

        return $builder;
    }

    private function daniel(): Builder
    {
        $daniel = $this->builder('Daniel Reyes', 'riverdale', [
            'headline' => 'Full-stack engineer',
            'bio' => 'Ten years shipping Laravel apps.',
            'building_summary' => 'Psalter, scripture memory with spaced repetition',
            'open_to' => ['co_founding', 'advising'],
        ]);
        $daniel->skills()->attach(Skill::where('name', 'Laravel')->value('id'), ['position' => 1]);
        ExperienceEntry::create([
            'builder_id' => $daniel->id, 'position' => 1, 'title' => 'Platform lead',
            'organization' => 'Northwind Logistics', 'started_on' => '2018-04-01', 'ended_on' => '2026-03-31',
        ]);

        return $daniel;
    }

    private function open(Builder $builder, ?User $as = null)
    {
        if ($as === null) {
            $this->app['auth']->forgetGuards();

            return $this->getJson("/api/v1/builders/{$builder->public_id}");
        }

        return $this->actingAs($as)->getJson("/api/v1/builders/{$builder->public_id}");
    }

    public function test_a_member_sees_every_populated_field_and_the_actions(): void
    {
        $daniel = $this->daniel();

        $profile = $this->open($daniel, $this->viewer)->assertOk()->json();

        $this->assertSame($daniel->public_id, $profile['id']);
        $this->assertSame('Daniel Reyes', $profile['name']);
        $this->assertSame('engineer', $profile['role']);
        $this->assertSame('Full-stack engineer', $profile['headline']);
        $this->assertNull($profile['photo_url']);
        $this->assertFalse($profile['is_own']);
        $this->assertSame(['name' => 'Riverdale', 'area' => 'Downtown Toronto'], $profile['neighbourhood']);
        $this->assertEqualsWithDelta(1.5, $profile['distance_km'], 0.1);
        $this->assertSame('Leslieville', $profile['distance_from']);
        $this->assertIsInt($profile['match']['score']);
        $this->assertContains(['code' => 'nearby', 'km' => 1.5], $profile['match']['reasons']);
        $this->assertSame(['Laravel'], $profile['skills']);
        $this->assertSame('Ten years shipping Laravel apps.', $profile['bio']);
        $this->assertSame([[
            'title' => 'Platform lead', 'organization' => 'Northwind Logistics',
            'started_on' => '2018-04-01', 'ended_on' => '2026-03-31',
        ]], $profile['experience']);
        $this->assertSame(['summary' => 'Psalter, scripture memory with spaced repetition'], $profile['building']);
        $this->assertSame(['co_founding', 'advising'], $profile['open_to']);
        $this->assertTrue($profile['online']);
        $this->assertSame('2026-03-14', $profile['member_since']);
        $this->assertSame(['say_hello' => false, 'report' => false, 'block' => false, 'edit' => false], $profile['actions']);
        $this->assertArrayNotHasKey('email', $profile);
    }

    public function test_a_sparse_profile_carries_only_its_populated_fields(): void
    {
        $esther = $this->builder('Esther Nguyen', 'the-annex');

        $profile = $this->open($esther, $this->viewer)->assertOk()->json();

        foreach (['bio', 'experience', 'building', 'skills', 'links'] as $empty) {
            $this->assertArrayNotHasKey($empty, $profile, $empty);
        }
        $this->assertSame('Esther Nguyen', $profile['name']);
    }

    public function test_missing_unfinished_and_hidden_profiles_answer_the_same_404(): void
    {
        $unfinished = $this->builder('Not Finished', 'riverdale', complete: false);
        $private = $this->builder('Private Builder', 'riverdale');

        // The same answer each time; only debug traces, which production never sends, differ.
        $message = $this->actingAs($this->viewer)->getJson('/api/v1/builders/01jb0000000000000000000000')
            ->assertNotFound()->json('message');
        $this->assertSame($message, $this->open($unfinished, $this->viewer)->assertNotFound()->json('message'));
        $this->assertSame($message, $this->open($private)->assertNotFound()->json('message'));
        $this->getJson('/api/v1/builders/not-an-id')->assertNotFound();
    }

    public function test_hidden_fields_are_absent(): void
    {
        $daniel = $this->daniel();
        PrivacySettings::create([
            'user_id' => $daniel->user_id,
            'location_precision' => 'city',
            'show_online_status' => false,
        ]);

        $profile = $this->open($daniel, $this->viewer)->json();

        $this->assertSame(['name' => 'Downtown Toronto', 'area' => 'Downtown Toronto'], $profile['neighbourhood']);
        $this->assertSame(0.0, (float) $profile['distance_km']);
        $this->assertArrayNotHasKey('online', $profile);
        $this->assertArrayNotHasKey('last_seen_at', $profile);
        $this->assertStringNotContainsString('Riverdale', json_encode($profile));
    }

    public function test_the_email_address_shows_only_when_the_builder_allows_it(): void
    {
        $daniel = $this->daniel();
        PrivacySettings::create(['user_id' => $daniel->user_id, 'email_contact' => true, 'profile_visibility' => 'everyone']);

        $this->assertSame('daniel.reyes@harvest.example', $this->open($daniel, $this->viewer)->json('email'));
        $this->assertArrayNotHasKey('email', $this->open($daniel)->json());
    }

    public function test_a_visitor_gets_the_reduced_profile_of_a_public_builder(): void
    {
        $daniel = $this->daniel();
        PrivacySettings::create(['user_id' => $daniel->user_id, 'profile_visibility' => 'everyone']);

        $profile = $this->open($daniel)->assertOk()->json();

        $this->assertSame(['id', 'name', 'role', 'headline', 'neighbourhood', 'skills', 'photo_url', 'is_own'], array_keys($profile));
    }

    public function test_the_own_profile_is_marked_and_offers_edit(): void
    {
        $own = $this->viewer->builder()->first();

        $profile = $this->open($own, $this->viewer)->assertOk()->json();

        $this->assertTrue($profile['is_own']);
        $this->assertSame(['say_hello' => false, 'report' => false, 'block' => false, 'edit' => true], $profile['actions']);
        $this->assertArrayNotHasKey('match', $profile);
        $this->assertArrayNotHasKey('distance_km', $profile);
    }
}
