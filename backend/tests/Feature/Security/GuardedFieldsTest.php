<?php

// Acceptance Test
// Traces to: L2-044
// Description:
// Given a request body that carries fields the member may not set, such as owner_id, user_id, role
// or verified_at, when it is received, then those fields are ignored: a shared project belongs to
// the member who sent it, and another member's settings and profile are never written.

namespace Tests\Feature\Security;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Support\CreatesMembers;
use Tests\TestCase;

class GuardedFieldsTest extends TestCase
{
    use CreatesMembers;
    use RefreshDatabase;

    public function test_a_shared_project_belongs_to_the_member_who_sent_it(): void
    {
        $victim = $this->member('Victim');
        $attacker = $this->member('Attacker');

        $this->actingAs($attacker)->postJson('/api/v1/projects', [
            'name' => 'Mine',
            'summary' => 'Sent by the attacker.',
            'stage' => 'idea',
            'looking_for' => [],
            'owner_id' => $victim->id,
            'feedback_count' => 99,
            'public_id' => str_repeat('z', 26),
        ])->assertCreated();

        $project = Project::where('name', 'Mine')->sole();
        $this->assertSame($attacker->id, $project->owner_id);
        $this->assertSame(0, $project->feedback_count);
        $this->assertNotSame(str_repeat('z', 26), $project->public_id);
    }

    public function test_a_privacy_save_never_writes_another_members_settings(): void
    {
        $victim = $this->member('Victim');
        $attacker = $this->member('Attacker');

        $this->actingAs($attacker)->putJson('/api/v1/settings/privacy', [
            'profile_visibility' => 'everyone',
            'location_precision' => 'city',
            'email_contact' => true,
            'show_online_status' => false,
            'list_in_attendees' => true,
            'user_id' => $victim->id,
        ])->assertOk();

        $this->assertSame(0, DB::table('privacy_settings')->where('user_id', $victim->id)->count());
        $this->assertSame(1, DB::table('privacy_settings')->where('user_id', $attacker->id)->count());
    }

    public function test_a_profile_save_cannot_change_roles_verification_or_owner(): void
    {
        $victim = $this->member('Victim');
        $attacker = $this->member('Attacker');
        $verifiedAt = $attacker->email_verified_at;
        $victimBuilder = DB::table('builders')->where('user_id', $victim->id)->first();

        $this->actingAs($attacker)->putJson('/api/v1/me/profile', [
            'user_id' => $victim->id,
            'builder_id' => $victimBuilder->id,
            'role' => 'engineer',
            'verified_at' => null,
            'email_verified_at' => null,
            'is_admin' => true,
            'public_id' => $victimBuilder->public_id,
        ]);

        $this->assertEquals($verifiedAt, $attacker->fresh()->email_verified_at);
        $this->assertEquals($victimBuilder, DB::table('builders')->where('user_id', $victim->id)->first());
        $this->assertNotSame($victimBuilder->public_id, DB::table('builders')->where('user_id', $attacker->id)->value('public_id'));
    }
}
