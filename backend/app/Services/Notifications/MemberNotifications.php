<?php

namespace App\Services\Notifications;

use App\Models\User;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\DB;

/** Queries over a member's own notification rows; every read goes through here so the block rule holds. */
class MemberNotifications
{
    public function __construct(private readonly BlockService $blocks) {}

    /**
     * The member's rows, leaving out those whose actor is blocked by, or has blocked, the member (L2-032).
     *
     * @return Builder<DatabaseNotification>
     */
    public function visibleTo(User $member): Builder
    {
        $query = DatabaseNotification::query()
            ->where('notifiable_type', $member->getMorphClass())
            ->where('notifiable_id', $member->getKey());

        return $this->blocks->applyScope($query, $member->id, DB::raw("(notifications.data->>'actor_user_id')::bigint"));
    }
}
