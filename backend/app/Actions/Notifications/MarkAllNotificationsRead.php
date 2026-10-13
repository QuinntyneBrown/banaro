<?php

namespace App\Actions\Notifications;

use App\Models\User;
use App\Services\Notifications\MemberNotifications;

/** Marks every unread notification of the member read (L2-027 criterion 3). */
class MarkAllNotificationsRead
{
    public function __construct(private readonly MemberNotifications $notifications) {}

    public function handle(User $member): void
    {
        $this->notifications->visibleTo($member)->whereNull('read_at')->update(['read_at' => now()]);
    }
}
