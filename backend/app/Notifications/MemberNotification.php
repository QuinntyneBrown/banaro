<?php

namespace App\Notifications;

use App\Enums\EmailCategory;
use App\Enums\NotificationKind;
use App\Models\EmailDelivery;
use App\Models\User;
use App\Services\Settings\EmailPreferenceService;
use App\Services\Settings\UnsubscribeTokenService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mime\Email;
use Throwable;

/**
 * Base of every notification about activity that concerns a member (L2-027, L2-029). It always
 * writes the in-app row and sends e-mail unless the member turned the category off; a notification
 * with no category is security-class and always sends. Send through NotifyMember.
 */
abstract class MemberNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /** Mail attempts, counting the first (L2-029 criterion 4: five retries). */
    public int $tries = 6;

    public function __construct()
    {
        $this->onQueue('mail');
        $this->afterCommit();
    }

    abstract public function kind(): NotificationKind;

    /** The e-mail category the member can switch off, or null when the e-mail always sends. */
    abstract public function category(): ?EmailCategory;

    /** What selecting the notification opens. @return array{type: string, id: string} */
    abstract public function subject(): array;

    /** Values the page puts in the sentence. @return array<string, scalar|null> */
    abstract public function params(): array;

    /** The e-mail without its footer; toMail adds the unsubscribe link for a categorised one. */
    abstract public function mail(object $notifiable): MailMessage;

    /**
     * Adds a one-click unsubscribe link to the body and the List-Unsubscribe headers when the e-mail
     * has a category (L2-029 criterion 3); security e-mail has none.
     */
    final public function toMail(object $notifiable): MailMessage
    {
        $message = $this->mail($notifiable);
        $category = $this->category();

        if ($category === null || ! $notifiable instanceof User) {
            return $message;
        }

        $token = app(UnsubscribeTokenService::class)->issue($notifiable, $category);
        $page = rtrim(config('app.frontend_url'), '/').'/unsubscribe?token='.$token;
        $oneClick = rtrim(config('app.url'), '/').'/api/v1/email-preferences/unsubscribe?token='.$token;

        return $message
            ->line(__('email.unsubscribe.line', [
                'category' => __('email.unsubscribe.categories.'.Str::camel($category->value)),
                'url' => $page,
            ]))
            ->withSymfonyMessage(function (Email $email) use ($page, $oneClick) {
                $email->getHeaders()->addTextHeader('List-Unsubscribe', "<{$oneClick}>, <{$page}>");
                $email->getHeaders()->addTextHeader('List-Unsubscribe-Post', 'List-Unsubscribe=One-Click');
            });
    }

    /** After the last attempt: records the failure and logs it for the alert (L2-029 criterion 4; D-058). */
    public function failed(Throwable $exception): void
    {
        if ($this->id) {
            EmailDelivery::where('notification_id', $this->id)->update(['status' => 'failed', 'failed_at' => now()]);
        }

        Log::error('email.delivery_failed', [
            'notification_id' => $this->id,
            'kind' => $this->kind()->value,
            'error' => $exception::class,
        ]);
    }

    /** The member who caused it, so a block hides it; null for system events. */
    public function actorUserId(): ?int
    {
        return null;
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function shouldSend(object $notifiable, string $channel): bool
    {
        if ($channel !== 'mail' || $this->category() === null || ! $notifiable instanceof User) {
            return true;
        }

        return app(EmailPreferenceService::class)->allows($notifiable, $this->category());
    }

    /** @return array<string, mixed> */
    public function toDatabase(object $notifiable): array
    {
        return [
            'kind' => $this->kind()->value,
            'subject' => $this->subject(),
            'params' => $this->params(),
            'actor_user_id' => $this->actorUserId(),
        ];
    }

    /** Seconds to wait before each retry (L2-029 criterion 4). @return list<int> */
    public function backoff(): array
    {
        return config('banaro.notifications.backoff');
    }
}
