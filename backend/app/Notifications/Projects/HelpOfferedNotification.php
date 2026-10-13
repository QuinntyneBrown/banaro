<?php

namespace App\Notifications\Projects;

use App\Enums\EmailCategory;
use App\Enums\NotificationKind;
use App\Models\Project;
use App\Models\User;
use App\Notifications\MemberNotification;
use Illuminate\Notifications\Messages\MailMessage;

/** Tells a project's owner that a member offered to help (L2-017 criterion 1, L2-029). */
class HelpOfferedNotification extends MemberNotification
{
    public function __construct(private readonly Project $project, private readonly User $offerer)
    {
        parent::__construct();
    }

    public function kind(): NotificationKind
    {
        return NotificationKind::HelpOffered;
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
        return ['project' => $this->project->name, 'offerer' => $this->offerer->name];
    }

    public function actorUserId(): ?int
    {
        return $this->offerer->id;
    }

    public function mail(object $notifiable): MailMessage
    {
        $web = rtrim(config('app.frontend_url'), '/');

        return (new MailMessage)
            ->subject(__('email.helpOffered.subject', ['project' => $this->project->name]))
            ->greeting(__('email.greeting', ['name' => $notifiable->name]))
            ->line(__('email.helpOffered.intro', ['offerer' => $this->offerer->name, 'project' => $this->project->name]))
            ->action(__('email.helpOffered.action'), $web.'/projects/'.$this->project->public_id);
    }
}
