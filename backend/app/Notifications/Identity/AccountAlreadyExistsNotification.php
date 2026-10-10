<?php

namespace App\Notifications\Identity;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when someone joins with a registered address (L2-001 criteria 3 and 10). It carries no
 * verification link, only the ways back in.
 */
class AccountAlreadyExistsNotification extends Notification implements ShouldQueue
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
            ->subject(__('email.accountExists.subject'))
            ->greeting(__('email.greeting', ['name' => $notifiable->name]))
            ->line(__('email.accountExists.intro'))
            ->action(__('email.accountExists.signIn'), $web.'/sign-in')
            ->line(__('email.accountExists.reset', ['url' => $web.'/forgot-password']))
            ->line(__('email.accountExists.ignore'));
    }
}
