<?php

// Acceptance Test
// Traces to: L2-003, L2-029
// Description: A sign-in from a browser and IP network the account has not used in the last 90
// days queues the security e-mail "New sign-in to your Banaro account" with the time and browser;
// the account's first sign-in and a familiar device send none.

namespace Tests\Feature\Identity;

use App\Models\User;
use App\Notifications\Identity\NewSignInNotification;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NewSignInAlertTest extends TestCase
{
    use RefreshDatabase;

    private const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

    private const FIREFOX = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:143.0) Gecko/20100101 Firefox/143.0';

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Notification::fake();
        $this->user = User::factory()->create([
            'name' => 'Amara Osei',
            'email' => 'amara@harvest.example',
            'password' => PasswordPolicy::hash('harvest-volunteers-2026'),
        ]);
    }

    private function signIn(string $userAgent, string $ip): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeader('User-Agent', $userAgent)
            ->postJson('/api/v1/session', ['email' => 'amara@harvest.example', 'password' => 'harvest-volunteers-2026'])
            ->assertOk();
        $this->deleteJson('/api/v1/session')->assertNoContent();
    }

    public function test_the_first_sign_in_sends_no_alert(): void
    {
        $this->signIn(self::CHROME, '203.0.113.10');

        Notification::assertNothingSent();
    }

    public function test_a_familiar_browser_on_a_familiar_network_sends_no_alert(): void
    {
        $this->signIn(self::CHROME, '203.0.113.10');
        $this->signIn(self::CHROME, '203.0.113.77');

        Notification::assertNothingSent();
    }

    public function test_a_new_browser_queues_the_alert_with_the_time_and_browser(): void
    {
        $this->signIn(self::CHROME, '203.0.113.10');
        Carbon::setTestNow(Carbon::parse('2026-10-09 18:30', 'America/Toronto'));

        $this->signIn(self::FIREFOX, '203.0.113.10');

        Notification::assertSentTo($this->user, NewSignInNotification::class, function ($notification) {
            $mail = $notification->toMail($this->user);
            $text = implode("\n", $mail->introLines);

            return $mail->subject === 'New sign-in to your Banaro account'
                && str_contains($text, 'Firefox on macOS')
                && str_contains($text, 'Friday 9 October 2026 at 6:30 pm');
        });
    }

    public function test_a_new_network_queues_the_alert(): void
    {
        $this->signIn(self::CHROME, '203.0.113.10');

        $this->signIn(self::CHROME, '198.51.100.20');

        Notification::assertSentToTimes($this->user, NewSignInNotification::class, 1);
    }

    public function test_a_device_unused_for_more_than_90_days_counts_as_new(): void
    {
        $this->signIn(self::CHROME, '203.0.113.10');
        Carbon::setTestNow(now()->addDays(91));

        $this->signIn(self::CHROME, '203.0.113.10');

        Notification::assertSentTo($this->user, NewSignInNotification::class);
    }

    public function test_the_alert_is_security_email_sent_on_the_mail_queue(): void
    {
        $this->signIn(self::CHROME, '203.0.113.10');
        $this->signIn(self::FIREFOX, '198.51.100.20');

        Notification::assertSentTo($this->user, NewSignInNotification::class, fn ($n) => $n->queue === 'mail');
    }
}
