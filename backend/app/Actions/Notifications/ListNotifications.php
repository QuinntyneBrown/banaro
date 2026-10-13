<?php

namespace App\Actions\Notifications;

use App\Models\User;
use App\Services\Notifications\MemberNotifications;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Pagination\LengthAwarePaginator;

/** The member's notifications, newest first, without those caused by a blocked member (L2-027 criterion 1). */
class ListNotifications
{
    public function __construct(private readonly MemberNotifications $notifications) {}

    /** @return LengthAwarePaginator<int, DatabaseNotification> */
    public function handle(User $member, int $page, int $perPage): LengthAwarePaginator
    {
        return $this->notifications->visibleTo($member)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);
    }
}
