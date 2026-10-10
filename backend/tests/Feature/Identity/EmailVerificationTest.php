<?php

// Acceptance Test
// Traces to: L2-002
// Description: A verification link verifies the account once within 24 hours; expired, unknown and
// used links change nothing; a resend queues a new link that ends earlier ones, is limited to 3 per
// hour, and answers 202 whether or not anything was sent.

namespace Tests\Feature\Identity;

use App\Models\User;
use App\Notifications\Identity\VerifyEmailNotification;
use App\Services\Identity\EmailVerificationService;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Notification::fake();
    }

    private function unverified(): User
    {
        return User::factory()->unverified()->create([
            'name' => 'Amara Osei',
            'email' => 'amara@harvest.example',
            'password' => PasswordPolicy::hash('harvest-volunteers-2026'),
        ]);
    }

    /** Issues a link and returns its token, as the e-mail would carry it. */
    private function tokenFor(User $user): string
    {
        $link = app(EmailVerificationService::class)->issue($user);
        parse_str((string) parse_url($link, PHP_URL_QUERY), $query);

        return $query['token'];
    }

    private function verify(string $token)
    {
        return $this->postJson('/api/v1/email/verify', ['token' => $token]);
    }

    private function resend(array $body = [])
    {
        return $this->postJson('/api/v1/email/verification-notification', $body);
    }

    public function test_a_fresh_link_verifies_the_account_without_signing_in(): void
    {
        $user = $this->unverified();

        $this->verify($this->tokenFor($user))->assertNoContent();

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertGuest('web');
    }

    public function test_a_link_older_than_24_hours_changes_nothing(): void
    {
        $user = $this->unverified();
        $token = $this->tokenFor($user);
        Carbon::setTestNow(now()->addHours(24)->addMinute());

        $this->verify($token)
            ->assertStatus(422)
            ->assertJsonPath('code', 'verification_link_invalid')
            ->assertJsonPath('link_known', true);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_a_tampered_link_changes_nothing(): void
    {
        $user = $this->unverified();
        $token = $this->tokenFor($user);

        $this->verify(strrev($token))
            ->assertStatus(422)
            ->assertJsonPath('code', 'verification_link_invalid')
            ->assertJsonPath('link_known', false);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_a_link_works_once(): void
    {
        $user = $this->unverified();
        $token = $this->tokenFor($user);
        $this->verify($token)->assertNoContent();

        $this->verify($token)->assertStatus(422)->assertJsonPath('code', 'verification_link_invalid');
    }

    public function test_a_malformed_token_is_a_field_error(): void
    {
        $this->verify('')->assertStatus(422)->assertJsonValidationErrors(['token']);
    }

    public function test_a_signed_in_member_can_ask_for_a_new_link_which_ends_earlier_links(): void
    {
        $user = $this->unverified();
        $old = $this->tokenFor($user);

        $this->actingAs($user, 'web')->resend()->assertStatus(202)->assertExactJson([]);

        Notification::assertSentTo($user, VerifyEmailNotification::class);
        $this->verify($old)->assertStatus(422);
    }

    public function test_a_used_or_expired_link_still_identifies_the_account_for_a_resend(): void
    {
        $user = $this->unverified();
        $token = $this->tokenFor($user);
        Carbon::setTestNow(now()->addDays(2));

        $this->resend(['token' => $token])->assertStatus(202);

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_a_resend_for_a_verified_or_unknown_account_sends_nothing_and_still_answers_202(): void
    {
        $verified = User::factory()->create(['email' => 'noah@harvest.example']);

        $this->resend(['email' => 'noah@harvest.example'])->assertStatus(202)->assertExactJson([]);
        $this->resend(['email' => 'nobody@harvest.example'])->assertStatus(202)->assertExactJson([]);

        Notification::assertNothingSent();
        $this->assertNotNull($verified->fresh()->email_verified_at);
    }

    public function test_no_more_than_three_resends_per_hour_per_account(): void
    {
        $user = $this->unverified();
        foreach (range(1, 3) as $i) {
            $this->actingAs($user, 'web')->resend()->assertStatus(202);
        }

        $this->actingAs($user, 'web')->resend()->assertStatus(429)->assertHeader('Retry-After');
        Notification::assertSentToTimes($user, VerifyEmailNotification::class, 3);
    }

    public function test_unknown_addresses_are_limited_the_same_way(): void
    {
        foreach (range(1, 3) as $i) {
            $this->resend(['email' => 'nobody@harvest.example'])->assertStatus(202);
        }

        $this->resend(['email' => 'NOBODY@harvest.example'])->assertStatus(429);
    }
}
