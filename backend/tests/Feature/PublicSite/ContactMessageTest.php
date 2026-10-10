<?php

// Acceptance Test
// Traces to: L2-040, L2-045
// Description: A visitor's contact message is validated and queued to the team; bots are
// discarded through the honeypot or stopped by the 3-per-hour limit.

namespace Tests\Feature\PublicSite;

use App\Jobs\PublicSite\DeliverContactMessage;
use App\Mail\ContactMessageMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ContactMessageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('contact');
        Queue::fake();
    }

    private function message(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Amara Osei',
            'email' => 'amara@harvest.example',
            'topic' => 'propose-event',
            'message' => 'Could our Saturday prayer group list a monthly breakfast on Banaro?',
            'website' => null,
        ], $overrides);
    }

    public function test_a_valid_message_is_queued_to_the_team(): void
    {
        $this->postJson('/api/v1/contact-messages', $this->message())
            ->assertStatus(202)
            ->assertExactJson([]);

        Queue::assertPushedOn('mail', DeliverContactMessage::class, function (DeliverContactMessage $job) {
            return $job->message->email === 'amara@harvest.example' && $job->message->topic->value === 'propose-event';
        });
    }

    public function test_each_topic_from_the_requirement_is_accepted(): void
    {
        foreach (['general', 'partnership', 'press', 'report-problem', 'propose-event'] as $i => $topic) {
            RateLimiter::clear('contact');
            $this->withServerVariables(['REMOTE_ADDR' => "10.0.0.{$i}"])
                ->postJson('/api/v1/contact-messages', $this->message(['topic' => $topic]))
                ->assertStatus(202);
        }
    }

    public function test_invalid_input_returns_422_with_an_error_per_field(): void
    {
        $this->postJson('/api/v1/contact-messages', [
            'name' => '',
            'email' => 'amara@',
            'topic' => 'gossip',
            'message' => 'Too short',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'topic', 'message']);

        Queue::assertNothingPushed();
    }

    public function test_message_length_is_10_to_2000_characters(): void
    {
        $this->postJson('/api/v1/contact-messages', $this->message(['message' => str_repeat('a', 2001)]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['message' => 'Use 2,000 characters or fewer']);

        $this->postJson('/api/v1/contact-messages', $this->message(['message' => str_repeat('a', 2000)]))
            ->assertStatus(202);
    }

    public function test_an_email_with_a_line_break_is_rejected(): void
    {
        $this->postJson('/api/v1/contact-messages', $this->message(['email' => "amara@harvest.example\r\nBcc: x@y.example"]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_a_filled_honeypot_looks_successful_but_is_discarded(): void
    {
        $this->postJson('/api/v1/contact-messages', $this->message(['website' => 'https://spam.example']))
            ->assertStatus(202)
            ->assertExactJson([]);

        Queue::assertNothingPushed();
    }

    public function test_the_fourth_message_from_one_ip_within_an_hour_is_rejected(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/v1/contact-messages', $this->message())->assertStatus(202);
        }

        $this->postJson('/api/v1/contact-messages', $this->message())
            ->assertStatus(429)
            ->assertHeader('Retry-After');

        Queue::assertPushed(DeliverContactMessage::class, 3);
    }

    public function test_the_job_mails_the_team_inbox_with_reply_to_the_sender(): void
    {
        Mail::fake();
        config(['banaro.contact_inbox' => 'team@banaro.ca']);

        $this->postJson('/api/v1/contact-messages', $this->message());
        Queue::pushed(DeliverContactMessage::class)->first()->handle();

        Mail::assertSent(ContactMessageMail::class, function (ContactMessageMail $mail) {
            return $mail->hasTo('team@banaro.ca')
                && $mail->hasReplyTo('amara@harvest.example')
                && str_contains($mail->render(), 'monthly breakfast');
        });
    }
}
