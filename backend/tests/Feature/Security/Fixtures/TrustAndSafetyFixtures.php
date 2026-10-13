<?php

namespace Tests\Feature\Security\Fixtures;

use App\Models\Block;
use App\Models\User;
use Tests\Feature\Security\Support\Expectation;
use Tests\Feature\Security\Support\RouteOwnershipFixture;
use Tests\Feature\Security\Support\Scenario;
use Tests\Feature\Security\Support\Snapshot;
use Tests\TestCase;

final class TrustAndSafetyFixtures
{
    /** @return list<RouteOwnershipFixture> */
    public static function fixtures(): array
    {
        // The owner has blocked a third member. Another member must neither see nor lift that block (L2-032).
        $ownersBlock = function (User $owner, TestCase $t) {
            $third = $t->member('Blocked Sentinel');
            Block::create(['blocker_id' => $owner->id, 'blocked_id' => $third->id]);

            // The third member is the caller's own input on store and destroy, so only the owner's e-mail is a sentinel.
            return new Scenario(
                params: ['builder' => $third->builder->public_id],
                sentinels: [$owner->email],
                intact: Snapshot::of('blocks', ['blocker_id' => $owner->id]),
            );
        };

        return [
            new RouteOwnershipFixture('blocks.index', Expectation::SelfOnly, function (User $owner, TestCase $t) use ($ownersBlock) {
                $scenario = $ownersBlock($owner, $t);

                // The list shows the caller's own blocks: the owner's blocked member must not appear in it.
                return new Scenario(sentinels: [...$scenario->sentinels, 'Blocked Sentinel'], intact: $scenario->intact);
            }),
            new RouteOwnershipFixture('blocks.store', Expectation::SelfOnly, $ownersBlock),
            new RouteOwnershipFixture('blocks.destroy', Expectation::SelfOnly, $ownersBlock),
        ];
    }
}
