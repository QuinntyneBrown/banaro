<?php

namespace Tests\Feature\Security\Fixtures;

use App\Models\User;
use Tests\Feature\Security\Support\Expectation;
use Tests\Feature\Security\Support\RouteOwnershipFixture;
use Tests\Feature\Security\Support\Scenario;
use Tests\TestCase;

final class IdentityFixtures
{
    /** @return list<RouteOwnershipFixture> */
    public static function fixtures(): array
    {
        return [
            // Signing out ends the caller's own session only (L2-003).
            new RouteOwnershipFixture('session.destroy', Expectation::SelfOnly, fn (User $owner, TestCase $t) => new Scenario(
                sentinels: [$owner->email],
            )),
        ];
    }
}
