<?php

namespace App\Notifications\Projects;

use App\Enums\EmailCategory;
use App\Enums\NotificationKind;
use App\Models\Project;
use App\Models\User;
use App\Notifications\MemberNotification;
use Illuminate\Notifications\Messages\MailMessage;

/** Tells a project's owner that someone left feedback (L2-016 criterion 1, L2-029). */
class FeedbackReceivedNotification extends MemberNotification
{
    public function __construct(private readonly Project $project, private readonly User $author)
    {
        parent::__construct();
    }

    public function kind(): NotificationKind
    {
        return NotificationKind::FeedbackReceived;
    }

    public function category(): ?EmailCategory
    {
        return EmailCategory::ProjectActivity;
    }

    public function subject(): array
    {
        return ['type' => 'project', 'id' => $this->project->public_id];
    }

    public function params(): array
    {
        return ['project' => $this->project->name, 'author' => $this->author->name];
    }

    public function actorUserId(): ?int
    {
        return $this->author->id;
    }

    public function mail(object $notifiable): MailMessage
    {
        $web = rtrim(config('app.frontend_url'), '/');

        return (new MailMessage)
            ->subject(__('email.feedbackReceived.subject', ['project' => $this->project->name]))
            ->greeting(__('email.greeting', ['name' => $notifiable->name]))
            ->line(__('email.feedbackReceived.intro', ['author' => $this->author->name, 'project' => $this->project->name]))
            ->action(__('email.feedbackReceived.action'), $web.'/projects/'.$this->project->public_id);
    }
}
