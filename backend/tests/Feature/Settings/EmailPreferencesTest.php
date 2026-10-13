<?php

// Acceptance Test
// Traces to: L2-037, L2-029, L2-044
// Description:
// Given a new account, when the member reads their e-mail preferences, then Matches, Messages,
// Events, Project activity and Weekly digest are all on. Given the member turns one category off,
// then only that category changes and each category saves on its own. Invalid categories and values
// are refused, and only a signed-in, verified member reads or changes their own preferences.

namespace Tests\Feature\Settings;

use App\Enums\EmailCategory;
use App\Models\User;
use App\Services\Settings\EmailPreferenceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailPreferencesTest extends TestCase
{
    use RefreshDatabase;

    private const ALL_ON = [
        'matches' => true,
        'messages' => true,
        'events' => true,
        'project_activity' => true,
        'weekly_digest' => true,
    ];

    public function test_a_new_account_has_every_category_on(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/v1/settings/email-preferences')
            ->assertOk()
            ->assertExactJson(self::ALL_ON);
    }

    public function test_turning_one_category_off_leaves_the_others_unchanged(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->putJson('/api/v1/settings/email-preferences/messages', ['enabled' => false])
            ->assertOk()
            ->assertExactJson([...self::ALL_ON, 'messages' => false]);

        $this->actingAs($member)->putJson('/api/v1/settings/email-preferences/events', ['enabled' => false])
            ->assertOk()
            ->assertExactJson([...self::ALL_ON, 'messages' => false, 'events' => false]);

        $this->actingAs($member)->putJson('/api/v1/settings/email-preferences/messages', ['enabled' => true])
            ->assertExactJson([...self::ALL_ON, 'events' => false]);

        $service = app(EmailPreferenceService::class);
        $this->assertFalse($service->allows($member, EmailCategory::Events));
        $this->assertTrue($service->allows($member, EmailCategory::Messages));
    }

    public function test_an_unknown_category_or_a_non_boolean_value_is_refused(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)->putJson('/api/v1/settings/email-preferences/newsletter', ['enabled' => false])
            ->assertStatus(422)->assertJsonValidationErrors('category');
        $this->actingAs($member)->putJson('/api/v1/settings/email-preferences/messages', ['enabled' => 'maybe'])
            ->assertStatus(422)->assertJsonValidationErrors('enabled');
        $this->actingAs($member)->putJson('/api/v1/settings/email-preferences/messages', [])
            ->assertStatus(422)->assertJsonValidationErrors('enabled');
    }

    public function test_one_member_never_changes_another_members_preferences(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($other)->putJson('/api/v1/settings/email-preferences/matches', ['enabled' => false])->assertOk();

        $this->actingAs($owner)->getJson('/api/v1/settings/email-preferences')->assertExactJson(self::ALL_ON);
    }

    public function test_preferences_need_a_signed_in_verified_member(): void
    {
        $this->getJson('/api/v1/settings/email-preferences')->assertUnauthorized();
        $this->putJson('/api/v1/settings/email-preferences/matches', ['enabled' => false])->assertUnauthorized();

        $this->actingAs(User::factory()->unverified()->create())
            ->getJson('/api/v1/settings/email-preferences')
            ->assertForbidden();
    }
}
