<?php

// Acceptance Test
// Traces to: L2-036, L2-009, L2-044, L2-045
// Description:
// Given a new account, when it reads its privacy settings, then the profile is for members only,
// online status is on, attendee listing is off, location shows the neighbourhood and e-mail contact
// is off. Given the privacy section, when the member saves all five settings, then each is stored and
// enforced on every API response: a members-only profile is left out of the signed-out directory,
// "City only" shows the city and a distance rounded to the nearest 5 km and never the neighbourhood,
// and hidden online status is absent from the card. Invalid values are refused.

namespace Tests\Feature\Settings;

use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\User;
use App\Services\Directory\BuilderSearchText;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrivacySettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $viewer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->viewer = $this->builder('Amara Osei', 'leslieville')->user;
    }

    private function builder(string $name, string $hood): Builder
    {
        $user = User::factory()->create(['name' => $name]);
        $builder = Builder::create([
            'user_id' => $user->id,
            'name' => $name,
            'role' => 'engineer',
            'neighbourhood_id' => Neighbourhood::where('slug', $hood)->value('id'),
            'open_to' => ['co_founding'],
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => now(),
            'last_active_at' => now(),
        ]);
        app(BuilderSearchText::class)->refresh($builder->id);

        return $builder;
    }

    /** @param  array<string, mixed>  $overrides */
    private function settings(array $overrides = []): array
    {
        return array_merge([
            'profile_visibility' => 'everyone',
            'location_precision' => 'neighbourhood',
            'email_contact' => false,
            'show_online_status' => true,
            'list_in_attendees' => false,
        ], $overrides);
    }

    private function save(User $user, array $settings)
    {
        return $this->actingAs($user)->putJson('/api/v1/settings/privacy', $settings);
    }

    private function cardFor(string $name, ?User $as = null): ?array
    {
        if ($as === null) {
            // A visitor: drop whoever an earlier request in this test signed in as.
            $this->app['auth']->forgetGuards();
        }
        $request = $as ? $this->actingAs($as) : $this;
        // Members look anywhere, so distance never hides the builder; visitors cannot filter.
        $query = 'q='.urlencode($name).($as ? '&distance=any' : '');
        $items = $request->getJson("/api/v1/builders?{$query}")->assertOk()->json('items');

        return collect($items)->firstWhere('name', $name);
    }

    public function test_a_new_account_starts_members_only_with_online_status_on_and_attendee_listing_off(): void
    {
        $this->actingAs($this->viewer)->getJson('/api/v1/settings/privacy')
            ->assertOk()
            ->assertExactJson([
                'profile_visibility' => 'members',
                'location_precision' => 'neighbourhood',
                'email_contact' => false,
                'show_online_status' => true,
                'list_in_attendees' => false,
            ]);
    }

    public function test_saving_stores_all_five_settings(): void
    {
        $saved = $this->settings([
            'profile_visibility' => 'everyone',
            'location_precision' => 'city',
            'email_contact' => true,
            'show_online_status' => false,
            'list_in_attendees' => true,
        ]);

        $this->save($this->viewer, $saved)->assertOk()->assertExactJson($saved);

        $this->actingAs($this->viewer)->getJson('/api/v1/settings/privacy')->assertExactJson($saved);
    }

    public function test_every_setting_is_required_and_checked(): void
    {
        $this->save($this->viewer, [])->assertStatus(422)->assertJsonValidationErrors([
            'profile_visibility', 'location_precision', 'email_contact', 'show_online_status', 'list_in_attendees',
        ]);
        $this->save($this->viewer, $this->settings(['profile_visibility' => 'nobody']))
            ->assertStatus(422)->assertJsonValidationErrors('profile_visibility');
        $this->save($this->viewer, $this->settings(['location_precision' => 'street']))
            ->assertStatus(422)->assertJsonValidationErrors('location_precision');
        $this->save($this->viewer, $this->settings(['show_online_status' => 'maybe']))
            ->assertStatus(422)->assertJsonValidationErrors('show_online_status');
    }

    public function test_only_a_signed_in_member_reads_or_saves_their_own_settings(): void
    {
        $this->getJson('/api/v1/settings/privacy')->assertUnauthorized();
        $this->putJson('/api/v1/settings/privacy', $this->settings())->assertUnauthorized();
    }

    public function test_a_members_only_profile_is_left_out_of_the_signed_out_directory(): void
    {
        $open = $this->builder('Open Builder', 'riverdale');
        $this->builder('Private Builder', 'riverdale');
        $this->save($open->user, $this->settings(['profile_visibility' => 'everyone']))->assertOk();

        $this->assertNotNull($this->cardFor('Open Builder'));
        $this->assertNull($this->cardFor('Private Builder'));
        $this->assertNotNull($this->cardFor('Private Builder', as: $this->viewer));
    }

    public function test_city_only_shows_the_city_and_a_distance_rounded_to_5_km(): void
    {
        $annex = $this->builder('Annex Builder', 'the-annex');
        $this->save($annex->user, $this->settings(['location_precision' => 'city']))->assertOk();

        $card = $this->cardFor('Annex Builder', as: $this->viewer);

        $this->assertSame(['name' => 'Downtown Toronto', 'area' => 'Downtown Toronto'], $card['neighbourhood']);
        $this->assertSame(5.0, (float) $card['distance_km']);
        $this->assertStringNotContainsString('Annex', json_encode($card['neighbourhood']));
    }

    public function test_hidden_online_status_is_absent_from_the_card(): void
    {
        $quiet = $this->builder('Quiet Builder', 'riverdale');
        $this->save($quiet->user, $this->settings(['show_online_status' => false]))->assertOk();

        $card = $this->cardFor('Quiet Builder', as: $this->viewer);

        $this->assertArrayNotHasKey('online', $card);
        $this->assertArrayNotHasKey('last_seen_at', $card);
    }
}
