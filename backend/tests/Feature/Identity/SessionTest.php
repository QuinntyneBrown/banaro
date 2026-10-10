<?php

// Acceptance Test
// Traces to: L2-003
// Description: A member signs in with e-mail and password and signs out. Wrong details get one
// generic answer, guessing is throttled per account and per IP, and the session identifier changes
// on sign-in.

namespace Tests\Feature\Identity;

use App\Models\User;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SessionTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'harvest-volunteers-2026';

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    private function member(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'name' => 'Amara Osei',
            'email' => 'amara@harvest.example',
            'password' => PasswordPolicy::hash(self::PASSWORD),
        ], $attributes));
    }

    private function signIn(array $overrides = [], string $ip = '10.2.0.1')
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/session', array_merge([
            'email' => 'Amara@Harvest.example',
            'password' => self::PASSWORD,
        ], $overrides));
    }

    public function test_a_visitor_has_no_session(): void
    {
        $this->getJson('/api/v1/session')->assertOk()->assertExactJson(['member' => null]);
    }

    public function test_valid_credentials_start_a_session_and_return_the_member(): void
    {
        $user = $this->member();

        $this->signIn()->assertOk()->assertExactJson(['member' => [
            'id' => $user->id,
            'name' => 'Amara Osei',
            'email' => 'amara@harvest.example',
            'email_verified' => true,
        ]]);

        $this->assertAuthenticatedAs($user, 'web');
        $this->getJson('/api/v1/session')->assertJsonPath('member.id', $user->id);
    }

    public function test_sign_in_issues_a_new_session_identifier(): void
    {
        $this->member();
        $this->startSession();
        $before = session()->getId();

        $this->signIn()->assertOk();

        $this->assertNotSame($before, session()->getId());
    }

    public function test_an_unverified_account_can_sign_in_and_is_reported_unverified(): void
    {
        $this->member(['email_verified_at' => null]);

        $this->signIn()->assertOk()->assertJsonPath('member.email_verified', false);
    }

    public function test_a_wrong_password_and_an_unknown_email_get_the_same_generic_answer(): void
    {
        $this->member();

        $wrongPassword = $this->signIn(['password' => 'not-the-right-one'])->assertStatus(422);
        $unknownEmail = $this->signIn(['email' => 'nobody@harvest.example'], '10.2.0.2')->assertStatus(422);

        foreach ([$wrongPassword, $unknownEmail] as $response) {
            $response->assertExactJson([
                'code' => 'invalid_credentials',
                'message' => "Those details don't match",
            ]);
        }
        $this->assertGuest('web');
    }

    public function test_a_password_over_128_characters_is_a_failed_attempt_with_the_generic_answer(): void
    {
        $this->member();

        $this->signIn(['password' => str_repeat('p', 129)])
            ->assertStatus(422)
            ->assertJsonPath('code', 'invalid_credentials');
    }

    public function test_empty_or_malformed_fields_get_field_errors(): void
    {
        $this->signIn(['email' => 'amara@', 'password' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_five_failures_for_one_account_are_throttled_with_retry_after(): void
    {
        $this->member();
        foreach (range(1, 5) as $i) {
            $this->signIn(['password' => 'wrong-password-'.$i], '10.2.1.'.$i)->assertStatus(422);
        }

        $this->signIn([], '10.2.1.9')->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_twenty_failures_from_one_ip_are_throttled_even_across_accounts(): void
    {
        foreach (range(1, 20) as $i) {
            $this->signIn(['email' => "guess{$i}@harvest.example"], '10.2.2.1')->assertStatus(422);
        }

        $this->member();
        $this->signIn([], '10.2.2.1')->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_a_successful_sign_in_clears_the_account_failures(): void
    {
        $this->member();
        foreach (range(1, 4) as $i) {
            $this->signIn(['password' => 'wrong-password-'.$i])->assertStatus(422);
        }
        $this->signIn()->assertOk();
        $this->deleteJson('/api/v1/session')->assertNoContent();

        $this->signIn(['password' => 'wrong-again'])->assertStatus(422);
        $this->signIn()->assertOk();
    }

    public function test_sign_out_destroys_the_session(): void
    {
        $this->member();
        $this->signIn()->assertOk();

        $this->deleteJson('/api/v1/session')->assertNoContent();

        $this->assertGuest('web');
        $this->getJson('/api/v1/session')->assertExactJson(['member' => null]);
    }

    public function test_sign_out_requires_a_session(): void
    {
        $this->deleteJson('/api/v1/session')->assertUnauthorized();
    }

    public function test_the_session_cookie_is_http_only_secure_and_same_site_lax(): void
    {
        $this->member();

        $cookie = $this->signIn()->getCookie(config('session.cookie'), decrypt: false);

        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertTrue($cookie->isSecure());
        $this->assertSame('lax', $cookie->getSameSite());
    }
}
