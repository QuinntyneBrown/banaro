<?php

// Acceptance Test
// Traces to: L2-029, L2-037
// Description:
// Given a notification that is sent twice with the same id, as a queue retry does, when the mail
// channel runs, then one e-mail is delivered. Given a notification with an e-mail category, then its
// e-mail carries a working one-click unsubscribe link for that category, in the body and in the
// List-Unsubscribe headers. Given security e-mail with no category, then it has no unsubscribe link.
// Given the mail provider fails, then the delivery is recorded as failed and the failure is logged
// with the notification id.

namespace Tests\Feature\Notifications;

use App\Enums\EmailCategory;
use App\Models\EmailDelivery;
use App\Models\User;
use App\Notifications\Channels\MailerChannel;
use App\Services\Settings\UnsubscribeTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\SentMessage;
use Tests\Support\ProbeNotification;
use Tests\TestCase;

class EmailDeliveryTest extends TestCase
{
    use RefreshDatabase;

    /** @return list<SentMessage> */
    private function sent(): array
    {
        return app('mailer')->getSymfonyTransport()->messages()->all();
    }

    private function send(User $member, ProbeNotification $notification): void
    {
        app(MailerChannel::class)->send($member, $notification);
    }

    public function test_sending_the_same_notification_id_twice_delivers_one_email(): void
    {
        $member = User::factory()->create();
        $notification = new ProbeNotification;
        $notification->id = (string) Str::uuid();

        $this->send($member, $notification);
        $this->send($member, $notification);

        $this->assertCount(1, $this->sent());
        $delivery = EmailDelivery::where('notification_id', $notification->id)->sole();
        $this->assertSame('sent', $delivery->status);
        $this->assertNotNull($delivery->sent_at);
        $this->assertSame($member->id, $delivery->user_id);
        $this->assertSame('project_activity', $delivery->category);
    }

    public function test_a_categorised_email_carries_a_working_unsubscribe_link_and_headers(): void
    {
        $member = User::factory()->create();
        $notification = new ProbeNotification(category: EmailCategory::ProjectActivity);
        $notification->id = (string) Str::uuid();

        $this->send($member, $notification);

        $email = $this->sent()[0]->getOriginalMessage();
        $headers = $email->getHeaders();
        $this->assertSame('List-Unsubscribe=One-Click', $headers->get('List-Unsubscribe-Post')->getBodyAsString());
        $this->assertTrue(preg_match('/token=([^>\s&]+)/', $headers->get('List-Unsubscribe')->getBodyAsString(), $match) === 1);

        $link = app(UnsubscribeTokenService::class)->verify($match[1]);
        $this->assertSame($member->id, $link['user']->id);
        $this->assertSame(EmailCategory::ProjectActivity, $link['category']);
        $this->assertStringContainsString($match[1], (string) $email->getHtmlBody());
    }

    public function test_security_email_has_no_unsubscribe_link(): void
    {
        $member = User::factory()->create();
        $notification = new ProbeNotification(category: null);
        $notification->id = (string) Str::uuid();

        $this->send($member, $notification);

        $email = $this->sent()[0]->getOriginalMessage();
        $this->assertFalse($email->getHeaders()->has('List-Unsubscribe'));
        $this->assertStringNotContainsString('unsubscribe', strtolower((string) $email->getHtmlBody()));
        $this->assertNull(EmailDelivery::where('notification_id', $notification->id)->value('category'));
    }

    public function test_a_failed_job_marks_the_delivery_failed_and_logs_it(): void
    {
        Log::spy();
        Log::shouldReceive('channel')->andReturn(\Mockery::spy());
        $member = User::factory()->create();
        $notification = new ProbeNotification;
        $notification->id = (string) Str::uuid();
        config(['mail.mailers.broken' => ['transport' => 'smtp', 'host' => '127.0.0.1', 'port' => 1, 'timeout' => 1]]);
        config(['mail.default' => 'broken']);

        try {
            $this->send($member, $notification);
            $this->fail('The broken mailer should have thrown.');
        } catch (\Throwable) {
            $notification->failed(new \RuntimeException('provider down'));
        }

        $delivery = EmailDelivery::where('notification_id', $notification->id)->sole();
        $this->assertSame('failed', $delivery->status);
        $this->assertNotNull($delivery->failed_at);
        $this->assertSame(1, $delivery->attempts);
        Log::shouldHaveReceived('error')->withArgs(fn (string $message, array $context = []) => $message === 'email.delivery_failed'
            && ($context['notification_id'] ?? null) === $notification->id)->once();
    }

    public function test_a_retry_after_a_failed_attempt_still_delivers_once(): void
    {
        $member = User::factory()->create();
        $notification = new ProbeNotification;
        $notification->id = (string) Str::uuid();

        config(['mail.mailers.broken' => ['transport' => 'smtp', 'host' => '127.0.0.1', 'port' => 1, 'timeout' => 1]]);
        config(['mail.default' => 'broken']);
        try {
            $this->send($member, $notification);
        } catch (\Throwable) {
            // First attempt fails.
        }
        config(['mail.default' => 'array']);
        app('mail.manager')->forgetMailers();

        $this->send($member, $notification);
        $this->send($member, $notification);

        $this->assertCount(1, $this->sent());
        $delivery = EmailDelivery::where('notification_id', $notification->id)->sole();
        $this->assertSame('sent', $delivery->status);
        $this->assertSame(2, $delivery->attempts);
    }
}
