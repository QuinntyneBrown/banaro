<?php

// Acceptance Test
// Traces to: L2-027, L2-029, L2-044
// Description:
// Given a member with notifications, when they list them, then they come newest first with kind,
// subject, parameters and an unread marker, 12 to a page and never more than 50. Given unread ones,
// then the unread count is exact. Marking one read leaves the rest unread and is harmless when
// repeated, and marking all read clears the count. Another member's notification is never reachable
// (404). A notification keeps its in-app row when the member has turned its e-mail category off, but
// sends no e-mail. A notification caused by a member who is blocked either way is not delivered and
// not listed.

namespace Tests\Feature\Notifications;

use App\Enums\EmailCategory;
use App\Enums\NotificationKind;
use App\Models\Block;
use App\Models\User;
use App\Notifications\MemberNotification;
use App\Services\Notifications\NotifyMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class InAppNotificationsTest extends TestCase
{
    use RefreshDatabase;

    private function notify(User $member, string $subjectId = 'p1', ?EmailCategory $category = EmailCategory::ProjectActivity, ?User $actor = null): void
    {
        app(NotifyMember::class)->handle($member, new ProbeNotification($subjectId, $category, $actor?->id));
    }

    private function sentMail(): int
    {
        return app('mailer')->getSymfonyTransport()->messages()->count();
    }

    public function test_notifications_list_newest_first_with_unread_markers(): void
    {
        $member = User::factory()->create();
        foreach (['first', 'second', 'third'] as $i => $subject) {
            Carbon::setTestNow(Carbon::parse('2026-10-12 09:00')->addMinutes($i));
            $this->notify($member, $subject);
        }
        $this->actingAs($member)->postJson('/api/v1/notifications/'.$member->notifications()->latest()->first()->id.'/read')->assertOk();

        $response = $this->actingAs($member)->getJson('/api/v1/notifications')->assertOk();

        $response->assertJsonPath('total', 3)->assertJsonPath('page', 1)->assertJsonPath('per_page', 12);
        $this->assertSame(['third', 'second', 'first'], array_column(array_column($response->json('items'), 'subject'), 'id'));
        $this->assertNotNull($response->json('items.0.read_at'));
        $this->assertNull($response->json('items.1.read_at'));
        $response->assertJsonPath('items.0.kind', 'feedback_received')
            ->assertJsonPath('items.0.subject.type', 'project')
            ->assertJsonPath('items.0.params.title', 'Psalter');
        $this->assertArrayHasKey('created_at', $response->json('items.0'));
    }

    public function test_the_unread_count_counts_only_unread_rows(): void
    {
        $member = User::factory()->create();
        $this->notify($member, 'a');
        $this->notify($member, 'b');
        $this->notify($member, 'c');
        $this->notify(User::factory()->create(), 'someone else');

        $this->actingAs($member)->getJson('/api/v1/notifications/unread-count')->assertOk()->assertExactJson(['count' => 3]);

        $this->actingAs($member)->postJson('/api/v1/notifications/'.$member->notifications()->first()->id.'/read')->assertOk();

        $this->actingAs($member)->getJson('/api/v1/notifications/unread-count')->assertExactJson(['count' => 2]);
    }

    public function test_marking_one_read_is_idempotent_and_marks_only_that_row(): void
    {
        $member = User::factory()->create();
        $this->notify($member, 'a');
        $this->notify($member, 'b');
        $target = $member->notifications()->first();

        Carbon::setTestNow('2026-10-12 10:00');
        $first = $this->actingAs($member)->postJson("/api/v1/notifications/{$target->id}/read")->assertOk()->json('read_at');
        Carbon::setTestNow('2026-10-12 11:00');
        $second = $this->actingAs($member)->postJson("/api/v1/notifications/{$target->id}/read")->assertOk()->json('read_at');

        $this->assertNotNull($first);
        $this->assertSame($first, $second);
        $this->assertSame(1, $member->unreadNotifications()->count());
    }

    public function test_mark_all_read_clears_the_count(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();
        $this->notify($member, 'a');
        $this->notify($member, 'b');
        $this->notify($other, 'c');

        $this->actingAs($member)->postJson('/api/v1/notifications/read-all')->assertNoContent();

        $this->actingAs($member)->getJson('/api/v1/notifications/unread-count')->assertExactJson(['count' => 0]);
        $this->assertSame(1, $other->unreadNotifications()->count());
    }

    public function test_another_members_notification_answers_404_and_stays_unread(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $this->notify($owner, 'secret');
        $id = $owner->notifications()->first()->id;

        $this->actingAs($intruder)->postJson("/api/v1/notifications/{$id}/read")->assertNotFound();

        $this->assertSame(1, $owner->unreadNotifications()->count());
        $this->actingAs($intruder)->getJson('/api/v1/notifications')->assertJsonPath('total', 0);
    }

    public function test_an_e_mail_category_turned_off_suppresses_the_mail_but_not_the_in_app_row(): void
    {
        $member = User::factory()->create();

        $this->notify($member, 'on');
        $this->assertSame(1, $this->sentMail());

        $this->actingAs($member)->putJson('/api/v1/settings/email-preferences/project_activity', ['enabled' => false])->assertOk();
        $this->notify($member, 'off');

        $this->assertSame(1, $this->sentMail());
        $this->assertSame(2, $member->notifications()->count());
    }

    public function test_a_notification_without_a_category_always_sends_its_mail(): void
    {
        $member = User::factory()->create();
        foreach (EmailCategory::cases() as $category) {
            $this->actingAs($member)->putJson("/api/v1/settings/email-preferences/{$category->value}", ['enabled' => false])->assertOk();
        }

        $this->notify($member, 'security', category: null);

        $this->assertSame(1, $this->sentMail());
    }

    public function test_a_notification_from_a_blocked_member_is_neither_delivered_nor_listed(): void
    {
        $member = User::factory()->create();
        $actor = User::factory()->create();
        $stranger = User::factory()->create();
        $this->notify($member, 'before block', actor: $actor);
        $this->notify($member, 'unrelated', actor: $stranger);

        Block::create(['blocker_id' => $member->id, 'blocked_id' => $actor->id]);
        $this->notify($member, 'after block', actor: $actor);

        $listed = $this->actingAs($member)->getJson('/api/v1/notifications')->assertOk();
        $this->assertSame(['unrelated'], array_column(array_column($listed->json('items'), 'subject'), 'id'));
        $this->assertSame(2, $member->notifications()->count());
        $this->actingAs($member)->getJson('/api/v1/notifications/unread-count')->assertExactJson(['count' => 1]);
    }

    public function test_the_page_size_defaults_to_12_and_is_capped_at_50(): void
    {
        $member = User::factory()->create();
        for ($i = 0; $i < 55; $i++) {
            $this->notify($member, "n{$i}");
        }

        $default = $this->actingAs($member)->getJson('/api/v1/notifications')->assertOk();
        $this->assertCount(12, $default->json('items'));
        $default->assertJsonPath('total', 55)->assertJsonPath('last_page', 5);

        $capped = $this->actingAs($member)->getJson('/api/v1/notifications?per_page=500')->assertOk();
        $this->assertCount(50, $capped->json('items'));
        $capped->assertJsonPath('per_page', 50);

        $this->actingAs($member)->getJson('/api/v1/notifications?page=2')->assertJsonPath('page', 2);
    }

    public function test_notifications_need_a_signed_in_verified_member(): void
    {
        $this->getJson('/api/v1/notifications')->assertUnauthorized();
        $this->getJson('/api/v1/notifications/unread-count')->assertUnauthorized();
        $this->postJson('/api/v1/notifications/read-all')->assertUnauthorized();

        $this->actingAs(User::factory()->unverified()->create())->getJson('/api/v1/notifications')->assertForbidden();
    }
}

/** A stand-in producer: the real ones arrive with projects, events, messaging and matching. */
class ProbeNotification extends MemberNotification
{
    public function __construct(private readonly string $subjectId, private readonly ?EmailCategory $category, private readonly ?int $actorId = null)
    {
        parent::__construct();
    }

    public function kind(): NotificationKind
    {
        return NotificationKind::FeedbackReceived;
    }

    public function category(): ?EmailCategory
    {
        return $this->category;
    }

    public function subject(): array
    {
        return ['type' => 'project', 'id' => $this->subjectId];
    }

    public function params(): array
    {
        return ['title' => 'Psalter'];
    }

    public function actorUserId(): ?int
    {
        return $this->actorId;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('New feedback on Psalter')->line('Someone left feedback.');
    }
}
