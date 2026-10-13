<?php

namespace Tests\Feature\Security\Support;

use Tests\Feature\Security\Fixtures\IdentityFixtures;
use Tests\Feature\Security\Fixtures\NotificationsFixtures;
use Tests\Feature\Security\Fixtures\ProfilesFixtures;
use Tests\Feature\Security\Fixtures\ProjectsFixtures;
use Tests\Feature\Security\Fixtures\SettingsFixtures;
use Tests\Feature\Security\Fixtures\TrustAndSafetyFixtures;

/** Every authenticated route with its cross-user case. A slice that adds a route adds its fixture here. */
final class RouteOwnershipRegistry
{
    /** @return array<string, RouteOwnershipFixture> keyed by route name */
    public static function all(): array
    {
        $fixtures = [
            ...IdentityFixtures::fixtures(),
            ...ProfilesFixtures::fixtures(),
            ...SettingsFixtures::fixtures(),
            ...TrustAndSafetyFixtures::fixtures(),
            ...NotificationsFixtures::fixtures(),
            ...ProjectsFixtures::fixtures(),
        ];

        $byName = [];
        foreach ($fixtures as $fixture) {
            $byName[$fixture->route] = $fixture;
        }

        return $byName;
    }
}
