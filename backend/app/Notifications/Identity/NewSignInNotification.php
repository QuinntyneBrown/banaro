<?php

namespace App\Notifications\Identity;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

/**
 * Security e-mail after a sign-in from a new device (L2-003 criterion 10). Member e-mail preferences
 * never suppress it (L2-029 criterion 2). It names the time and browser; there is no location
 * lookup (decision D-023).
 */
class NewSignInNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Carbon $at, public readonly string $browser)
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
        $time = $this->at->copy()->timezone('America/Toronto')->format('l j F Y \a\t g:i a');

        return (new MailMessage)
            ->subject(__('email.newSignIn.subject'))
            ->greeting(__('email.greeting', ['name' => $notifiable->name]))
            ->line(__('email.newSignIn.intro', ['browser' => $this->browser, 'time' => $time]))
            ->line(__('email.newSignIn.ifYou'))
            ->action(__('email.newSignIn.reset'), $web.'/forgot-password')
            ->line(__('email.newSignIn.help', ['url' => $web.'/contact']));
    }
}
