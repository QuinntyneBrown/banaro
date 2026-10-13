<?php

// Acceptance Test
// Traces to: L2-004, L2-029
// Description: Asking for a reset link answers the same for any well-formed address and e-mails a
// link only to a registered one; a link under 60 minutes old sets a compliant new password once,
// verifies the address, ends every session and sends a security e-mail; expired, used and tampered
// links change nothing; requests are limited to 5 per hour per address or IP.

namespace Tests\Feature\Identity;

use App\Models\User;
use App\Notifications\Identity\PasswordChangedNotification;
use App\Notifications\Identity\ResetPasswordNotification;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private const OLD = 'harvest-volunteers-2026';

    private const NEW = 'lanterns-on-queen-street';

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Notification::fake();
    }

    private function member(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'name' => 'Amara Osei',
            'email' => 'amara@harvest.example',
            'password' => PasswordPolicy::hash(self::OLD),
        ], $attributes));
    }

    private function forgot(string $email, string $ip = '10.4.0.1')
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/forgot-password', ['email' => $email]);
    }

    private function reset(string $token, array $overrides = [])
    {
        return $this->postJson('/api/v1/reset-password', array_merge([
            'email' => 'amara@harvest.example',
            'token' => $token,
            'password' => self::NEW,
            'password_confirmation' => self::NEW,
        ], $overrides));
    }

    /** The token the e-mailed link carries. */
    private function tokenFor(User $user): string
    {
        return Password::broker()->createToken($user);
    }

    public function test_a_registered_address_gets_a_reset_link_and_any_address_gets_the_same_answer(): void
    {
        $user = $this->member();

        $this->forgot('Amara@Harvest.example')->assertStatus(202)->assertExactJson([]);
        $this->forgot('nobody@harvest.example')->assertStatus(202)->assertExactJson([]);

        Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) {
            return str_contains($notification->toMail(User::first())->actionUrl, '/reset-password?token=');
        });
        Notification::assertCount(1);
    }

    public function test_a_malformed_address_is_a_field_error(): void
    {
        $this->forgot('amara@')->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_more_than_five_requests_per_address_in_an_hour_are_refused(): void
    {
        foreach (range(1, 5) as $i) {
            $this->forgot('nobody@harvest.example', '10.4.1.'.$i)->assertStatus(202);
        }

        $this->forgot('nobody@harvest.example', '10.4.1.9')->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_more_than_five_requests_per_ip_in_an_hour_are_refused(): void
    {
        foreach (range(1, 5) as $i) {
            $this->forgot("someone{$i}@harvest.example", '10.4.2.1')->assertStatus(202);
        }

        $this->forgot('another@harvest.example', '10.4.2.1')->assertStatus(429);
    }

    public function test_a_fresh_link_checks_out_and_an_expired_or_tampered_one_does_not(): void
    {
        $token = $this->tokenFor($this->member());
        $check = fn (string $t) => $this->postJson('/api/v1/reset-password/check', ['email' => 'amara@harvest.example', 'token' => $t]);

        $check($token)->assertNoContent();
        $check(strrev($token))->assertStatus(422)->assertJsonPath('code', 'reset_link_invalid');
        Carbon::setTestNow(now()->addMinutes(61));
        $check($token)->assertStatus(422)->assertJsonPath('code', 'reset_link_invalid');
    }

    public function test_a_fresh_link_sets_the_new_password_once(): void
    {
        $user = $this->member();
        $token = $this->tokenFor($user);

        $this->reset($token)->assertNoContent();

        $this->assertTrue(PasswordPolicy::check(self::NEW, $user->fresh()->password));
        $this->reset($token, ['password' => 'another-good-password', 'password_confirmation' => 'another-good-password'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'reset_link_invalid');
    }

    public function test_an_expired_link_changes_nothing(): void
    {
        $user = $this->member();
        $token = $this->tokenFor($user);
        Carbon::setTestNow(now()->addMinutes(61));

        $this->reset($token)->assertStatus(422)->assertJsonPath('code', 'reset_link_invalid');

        $this->assertTrue(PasswordPolicy::check(self::OLD, $user->fresh()->password));
    }

    public function test_short_common_mismatched_and_current_passwords_are_refused_with_specific_messages(): void
    {
        $token = $this->tokenFor($this->member());

        $this->reset($token, ['password' => 'short', 'password_confirmation' => 'short'])
            ->assertJsonValidationErrors(['password' => 'Use at least 12 characters']);
        $this->reset($token, ['password' => 'Unbelievable', 'password_confirmation' => 'Unbelievable'])
            ->assertJsonValidationErrors(['password' => 'That password is too common. Choose something harder to guess.']);
        $this->reset($token, ['password_confirmation' => 'something-else-entirely'])
            ->assertJsonValidationErrors(['password' => "The two passwords don't match"]);
        $this->reset($token, ['password' => self::OLD, 'password_confirmation' => self::OLD])
            ->assertJsonValidationErrors(['password' => 'Choose a different password. This one is your current password.']);
    }

    public function test_a_reset_verifies_an_unverified_address_and_sends_a_security_email(): void
    {
        $user = $this->member(['email_verified_at' => null]);

        $this->reset($this->tokenFor($user))->assertNoContent();

        $this->assertNotNull($user->fresh()->email_verified_at);
        Notification::assertSentTo($user, PasswordChangedNotification::class, function ($notification) use ($user) {
            $mail = $notification->toMail($user);

            return $mail->subject === 'Your Banaro password was changed' && $notification->queue === 'mail';
        });
    }

    public function test_a_reset_ends_the_session_it_was_made_in(): void
    {
        $user = $this->member();
        $this->postJson('/api/v1/session', ['email' => 'amara@harvest.example', 'password' => self::OLD])->assertOk();

        $this->reset($this->tokenFor($user))->assertNoContent();

        $this->getJson('/api/v1/session')->assertExactJson(['member' => null]);
    }
}
