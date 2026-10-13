<?php

namespace App\Actions\Notifications;

use App\Models\User;
use App\Services\Notifications\MemberNotifications;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Notifications\DatabaseNotification;

/** Marks one of the member's own notifications read; repeating it keeps the first time (L2-027 criterion 1). */
class MarkNotificationRead
{
    public function __construct(private readonly MemberNotifications $notifications) {}

    /** @throws ModelNotFoundException when the row is not the member's own */
    public function handle(User $member, string $id): DatabaseNotification
    {
        $notification = $this->notifications->visibleTo($member)->findOrFail($id);
        $notification->markAsRead();

        return $notification;
    }
}
