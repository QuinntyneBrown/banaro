<?php

namespace Tests\Feature\Security\Fixtures;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Security\Support\Expectation;
use Tests\Feature\Security\Support\RouteOwnershipFixture;
use Tests\Feature\Security\Support\Scenario;
use Tests\Feature\Security\Support\Snapshot;
use Tests\TestCase;

final class SettingsFixtures
{
    /** @return list<RouteOwnershipFixture> */
    public static function fixtures(): array
    {
        $privacy = fn (User $owner, TestCase $t) => new Scenario(
            body: [
                'profile_visibility' => 'everyone',
                'location_precision' => 'city',
                'email_contact' => true,
                'show_online_status' => false,
                'list_in_attendees' => true,
            ],
            sentinels: [$owner->email],
            intact: Snapshot::of('privacy_settings', ['user_id' => $owner->id]),
        );

        $emailPreferences = function (User $owner, TestCase $t) {
            DB::table('email_preferences')->insert([
                'user_id' => $owner->id, 'category' => 'messages', 'enabled' => false, 'created_at' => now(), 'updated_at' => now(),
            ]);

            return new Scenario(
                params: ['category' => 'messages'],
                body: ['enabled' => true],
                sentinels: [$owner->email],
                intact: Snapshot::of('email_preferences', ['user_id' => $owner->id]),
            );
        };

        return [
            // Settings routes name no record: they read or change the signed-in member's own settings (L2-036, L2-037).
            new RouteOwnershipFixture('settings.privacy.show', Expectation::SelfOnly, $privacy),
            new RouteOwnershipFixture('settings.privacy.update', Expectation::SelfOnly, $privacy),
            new RouteOwnershipFixture('settings.email-preferences.show', Expectation::SelfOnly, $emailPreferences),
            new RouteOwnershipFixture('settings.email-preferences.update', Expectation::SelfOnly, $emailPreferences),
        ];
    }
}
