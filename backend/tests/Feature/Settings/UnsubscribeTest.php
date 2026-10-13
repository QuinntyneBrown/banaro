<?php

// Acceptance Test
// Traces to: L2-037, L2-029
// Description:
// Given a signed unsubscribe link from an e-mail, when it is followed without a session, then the
// named category is turned off for the named member and the page can confirm it. Following the same
// link twice is harmless. Given a tampered link, or a link for an account that does not exist, then
// nothing changes and the API answers 422 with code invalid_unsubscribe_link.

namespace Tests\Feature\Settings;

use App\Enums\EmailCategory;
use App\Models\User;
use App\Services\Settings\EmailPreferenceService;
use App\Services\Settings\UnsubscribeTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnsubscribeTest extends TestCase
{
    use RefreshDatabase;

    private function token(User $member, EmailCategory $category): string
    {
        return app(UnsubscribeTokenService::class)->issue($member, $category);
    }

    public function test_a_valid_link_turns_the_category_off_without_a_session(): void
    {
        $member = User::factory()->create();

        $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => $this->token($member, EmailCategory::Messages)])
            ->assertOk()
            ->assertExactJson(['category' => 'messages']);

        $service = app(EmailPreferenceService::class);
        $this->assertFalse($service->allows($member, EmailCategory::Messages));
        $this->assertTrue($service->allows($member, EmailCategory::Matches));
    }

    public function test_following_the_same_link_twice_is_harmless(): void
    {
        $member = User::factory()->create();
        $token = $this->token($member, EmailCategory::WeeklyDigest);

        $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => $token])->assertOk();
        $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => $token])
            ->assertOk()->assertExactJson(['category' => 'weekly_digest']);
    }

    public function test_a_tampered_link_changes_nothing_and_answers_422(): void
    {
        $member = User::factory()->create();
        $token = $this->token($member, EmailCategory::Messages);
        [$payload, $signature] = explode('.', $token);
        $forged = rtrim(strtr(base64_encode($member->id.':events'), '+/', '-_'), '=').'.'.$signature;

        foreach ([$payload.'.AAAA', $forged, 'garbage', ''] as $bad) {
            $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => $bad])
                ->assertStatus(422);
        }
        $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => $forged])
            ->assertJsonPath('code', 'invalid_unsubscribe_link');

        $service = app(EmailPreferenceService::class);
        $this->assertTrue($service->allows($member, EmailCategory::Messages));
        $this->assertTrue($service->allows($member, EmailCategory::Events));
    }

    public function test_a_link_for_an_account_that_does_not_exist_answers_422(): void
    {
        $member = User::factory()->create();
        $token = $this->token($member, EmailCategory::Messages);
        $member->delete();

        $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => $token])
            ->assertStatus(422)
            ->assertJsonPath('code', 'invalid_unsubscribe_link');
    }

    public function test_the_endpoint_is_limited_per_address(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => 'garbage'])->assertStatus(422);
        }

        $this->postJson('/api/v1/email-preferences/unsubscribe', ['token' => 'garbage'])->assertStatus(429);
    }
}
