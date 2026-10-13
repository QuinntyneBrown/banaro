<?php

namespace Tests\Feature\Security\Fixtures;

use App\Enums\PhotoStatus;
use App\Models\ProfilePhoto;
use App\Models\User;
use Tests\Feature\Security\Support\Expectation;
use Tests\Feature\Security\Support\RouteOwnershipFixture;
use Tests\Feature\Security\Support\Scenario;
use Tests\Feature\Security\Support\Snapshot;
use Tests\TestCase;

final class ProfilesFixtures
{
    /** @return list<RouteOwnershipFixture> */
    public static function fixtures(): array
    {
        $own = fn (User $owner, TestCase $t) => new Scenario(
            sentinels: [$owner->email, $owner->name],
            intact: Snapshot::of('builders', ['user_id' => $owner->id]),
        );

        $fixtures = [];
        foreach (['onboarding.show', 'onboarding.about', 'onboarding.skills', 'onboarding.goals', 'onboarding.complete', 'profile.show', 'profile.update', 'photo.store', 'photo.destroy'] as $route) {
            // These routes name no record: they read or change the signed-in member's own profile (L2-006 to L2-008).
            $fixtures[] = new RouteOwnershipFixture($route, Expectation::SelfOnly, $own);
        }

        // Another member's photo id answers 404 (L2-044 criterion 1).
        $fixtures[] = new RouteOwnershipFixture('photo.show', Expectation::NotFound, function (User $owner, TestCase $t) {
            $photo = ProfilePhoto::create([
                'builder_id' => $owner->builder->id,
                'path' => 'media/'.str_repeat('a', 20),
                'status' => PhotoStatus::Ready,
            ]);

            return new Scenario(params: ['photo' => $photo->id], sentinels: [$photo->path]);
        });

        return $fixtures;
    }
}
