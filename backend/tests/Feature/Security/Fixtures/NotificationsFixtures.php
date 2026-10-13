<?php

namespace Tests\Feature\Security\Fixtures;

use App\Models\User;
use Tests\Feature\Security\Support\Expectation;
use Tests\Feature\Security\Support\RouteOwnershipFixture;
use Tests\Feature\Security\Support\Scenario;
use Tests\Support\ProbeNotification;
use Tests\TestCase;

final class NotificationsFixtures
{
    /** @return list<RouteOwnershipFixture> */
    public static function fixtures(): array
    {
        $ownersNotification = function (User $owner, TestCase $t) {
            $owner->notify(new ProbeNotification('sentinel-subject'));
            $notification = $owner->notifications()->sole();

            return new Scenario(
                params: ['notification' => $notification->id],
                // The id is the caller's own input on a by-id route, so it is not a sentinel.
                sentinels: ['sentinel-subject', $owner->email],
                intact: fn () => $owner->unreadNotifications()->count() === 1,
            );
        };
        $withoutParams = function (User $owner, TestCase $t) use ($ownersNotification) {
            $scenario = $ownersNotification($owner, $t);

            return new Scenario(sentinels: $scenario->sentinels, intact: $scenario->intact);
        };

        return [
            new RouteOwnershipFixture('notifications.index', Expectation::SelfOnly, $withoutParams),
            new RouteOwnershipFixture('notifications.unread-count', Expectation::SelfOnly, $withoutParams),
            new RouteOwnershipFixture('notifications.read-all', Expectation::SelfOnly, $withoutParams),
            // Another member's notification id answers 404 (L2-027 criterion 5, L2-044 criterion 1).
            new RouteOwnershipFixture('notifications.read', Expectation::NotFound, $ownersNotification),
        ];
    }
}
