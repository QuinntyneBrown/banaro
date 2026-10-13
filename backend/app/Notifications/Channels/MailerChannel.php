<?php

namespace App\Notifications\Channels;

use App\Models\EmailDelivery;
use App\Notifications\MemberNotification;
use Illuminate\Notifications\Channels\MailChannel;
use Illuminate\Notifications\Notification;

/**
 * The mail channel for every notification. For a member notification it records one delivery per
 * notification id and sends nothing once that row says sent, so a retried job never mails twice
 * (L2-029 criterion 1). Other notifications, such as the identity e-mail, pass straight through.
 */
class MailerChannel extends MailChannel
{
    public function send($notifiable, Notification $notification)
    {
        if (! $notification instanceof MemberNotification || ! $notification->id) {
            return parent::send($notifiable, $notification);
        }

        $delivery = EmailDelivery::firstOrCreate(
            ['notification_id' => $notification->id],
            ['user_id' => $notifiable->getKey(), 'category' => $notification->category()?->value],
        );

        if ($delivery->status === 'sent') {
            return null;
        }

        $delivery->increment('attempts');
        $sent = parent::send($notifiable, $notification);
        $delivery->update(['status' => 'sent', 'sent_at' => now()]);

        return $sent;
    }
}
