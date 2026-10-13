<?php

namespace App\Notifications\Identity;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/** Security e-mail after a password change (L2-004 criterion 9); preferences never suppress it. */
class PasswordChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->onQueue('mail');
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $web = rtrim(config('app.frontend_url'), '/');

        return (new MailMessage)
            ->subject(__('email.passwordChanged.subject'))
            ->greeting(__('email.greeting', ['name' => $notifiable->name]))
            ->line(__('email.passwordChanged.intro'))
            ->line(__('email.passwordChanged.notYou'))
            ->action(__('email.passwordChanged.reset'), $web.'/forgot-password')
            ->line(__('email.passwordChanged.help', ['url' => $web.'/contact']));
    }
}
