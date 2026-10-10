<?php

// Acceptance Test
// Traces to: L2-001, L2-034
// Description: A visitor joins with name, e-mail, a compliant password and the code of conduct;
// the account starts unverified and a verification e-mail is queued, without revealing whether an
// address is already registered.

namespace Tests\Feature\Identity;

use App\Models\User;
use App\Notifications\Identity\AccountAlreadyExistsNotification;
use App\Notifications\Identity\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class JoinTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
    }

    private function join(array $overrides = [], string $ip = '10.1.0.1')
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/join', array_merge([
            'name' => 'Amara Osei',
            'email' => 'Amara@Harvest.example',
            'password' => 'harvest-volunteers-2026',
            'agreed_to_code_of_conduct' => true,
        ], $overrides));
    }

    public function test_joining_creates_an_unverified_account_and_queues_a_verification_email(): void
    {
        $this->join()->assertStatus(202)->assertExactJson([]);

        $user = User::firstWhere('email', 'amara@harvest.example');
        $this->assertNotNull($user);
        $this->assertSame('Amara Osei', $user->name);
        $this->assertNull($user->email_verified_at);
        $this->assertSame(config('banaro.code_of_conduct_version'), $user->code_of_conduct_version);
        $this->assertNotNull($user->code_of_conduct_accepted_at);
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_the_password_is_hashed_with_bcrypt_cost_12_and_never_returned(): void
    {
        $response = $this->join();

        $user = User::firstWhere('email', 'amara@harvest.example');
        $this->assertStringStartsWith('$2y$12$', $user->password);
        $this->assertTrue(Hash::check(base64_encode(hash('sha256', 'harvest-volunteers-2026', true)), $user->password));
        $this->assertStringNotContainsString('harvest-volunteers-2026', $response->getContent());
        $this->assertArrayNotHasKey('password', $user->toArray());
    }

    public function test_invalid_input_returns_422_per_field_and_creates_nothing(): void
    {
        $this->join(['name' => '', 'email' => 'amara@', 'password' => 'short', 'agreed_to_code_of_conduct' => false])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'agreed_to_code_of_conduct']);

        $this->assertSame(0, User::count());
    }

    public function test_lengths_are_capped_with_specific_messages(): void
    {
        $this->join(['name' => str_repeat('a', 101), 'password' => str_repeat('b', 129)])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'name' => 'Use 100 characters or fewer',
                'password' => 'Use 128 characters or fewer',
            ]);
    }

    public function test_a_common_password_is_rejected(): void
    {
        $this->join(['password' => 'Unbelievable'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['password' => 'That password is too common. Choose something harder to guess.']);
    }

    public function test_an_existing_address_in_any_case_creates_no_second_account_and_gets_a_notice(): void
    {
        $this->join(['email' => 'Amara@Example.com']);
        Notification::fake();

        $this->join(['email' => 'amara@example.com', 'name' => 'Someone Else'], '10.1.0.2')
            ->assertStatus(202)
            ->assertExactJson([]);

        $this->assertSame(1, User::count());
        $existing = User::firstWhere('email', 'amara@example.com');
        Notification::assertSentTo($existing, AccountAlreadyExistsNotification::class);
        Notification::assertNotSentTo($existing, VerifyEmailNotification::class);
    }

    public function test_the_already_registered_email_links_to_sign_in_and_reset_without_a_verification_link(): void
    {
        $this->join();
        $user = User::firstWhere('email', 'amara@harvest.example');

        $mail = (new AccountAlreadyExistsNotification)->toMail($user);

        $this->assertSame('You already have a Banaro account', $mail->subject);
        $text = implode("\n", array_merge($mail->introLines, $mail->outroLines)).' '.$mail->actionUrl;
        $this->assertStringContainsString('/sign-in', $text);
        $this->assertStringContainsString('/forgot-password', $text);
        $this->assertStringNotContainsString('verify', strtolower($text));
    }

    public function test_joining_creates_no_builder_profile(): void
    {
        $this->join();

        $this->assertNull(User::firstWhere('email', 'amara@harvest.example')->builder);
    }

    public function test_the_sixth_join_from_one_ip_within_ten_minutes_is_rejected(): void
    {
        RateLimiter::clear('join');
        for ($i = 0; $i < 5; $i++) {
            $this->join(['email' => "person{$i}@harvest.example"], '10.9.9.9')->assertStatus(202);
        }

        $this->join(['email' => 'person6@harvest.example'], '10.9.9.9')
            ->assertStatus(429)
            ->assertHeader('Retry-After');
    }
}
