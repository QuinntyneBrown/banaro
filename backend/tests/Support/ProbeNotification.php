<?php

namespace Tests\Support;

use App\Enums\EmailCategory;
use App\Enums\NotificationKind;
use App\Notifications\MemberNotification;
use Illuminate\Notifications\Messages\MailMessage;

/** A stand-in producer for notification tests: the real ones arrive with projects, events, messaging and matching. */
class ProbeNotification extends MemberNotification
{
    public function __construct(
        private readonly string $subjectId = 'p1',
        private readonly ?EmailCategory $category = EmailCategory::ProjectActivity,
        private readonly ?int $actorId = null,
    ) {
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

    public function mail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject('New feedback on Psalter')->line('Someone left feedback.');
    }
}
