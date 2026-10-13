<?php

namespace App\Actions\Notifications;

use App\Models\User;
use App\Services\Notifications\MemberNotifications;

/** The number the header shows; the page caps its display at "99+" (L2-027 criterion 2). */
class CountUnreadNotifications
{
    public function __construct(private readonly MemberNotifications $notifications) {}

    public function handle(User $member): int
    {
        return $this->notifications->visibleTo($member)->whereNull('read_at')->count();
    }
}
