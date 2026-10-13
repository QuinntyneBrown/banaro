<?php

namespace App\Services\Notifications;

use App\Models\User;
use App\Notifications\MemberNotification;
use App\Services\TrustAndSafety\BlockService;

/** The one way to tell a member about activity: a block in either direction drops it (L2-032). */
class NotifyMember
{
    public function __construct(private readonly BlockService $blocks) {}

    public function handle(User $member, MemberNotification $notification): void
    {
        $actor = $notification->actorUserId();

        if ($actor !== null && $this->blocks->isBlockedEitherWay($member->id, $actor)) {
            return;
        }

        $member->notify($notification);
    }
}
