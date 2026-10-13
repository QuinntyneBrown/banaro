<?php

// Acceptance Test
// Traces to: L2-032, L2-011, L2-044, L2-045
// Description:
// Given a member, when they block another builder, then both are hidden from each other in the
// directory and search, and each other's profile answers 404. Blocking is idempotent, sends nothing to
// the blocked party and refuses the member's own profile. The blocker's blocked list shows the builder,
// and unblocking restores visibility in both directions unless the other member blocked them too.
// A builder who already blocked the member cannot be found to block. Profiles offer "Block" to members
// viewing someone else.

namespace Tests\Feature\TrustAndSafety;

use App\Models\Block;
use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\User;
use App\Services\Directory\BuilderSearchText;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class BlockBuilderTest extends TestCase
{
    use RefreshDatabase;

    private User $amara;

    private Builder $daniel;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->amara = $this->builder('Amara Osei')->user;
        $this->daniel = $this->builder('Daniel Reyes');
    }

    private function builder(string $name): Builder
    {
        $user = User::factory()->create(['name' => $name]);
        $builder = Builder::create([
            'user_id' => $user->id,
            'name' => $name,
            'role' => 'engineer',
            'neighbourhood_id' => Neighbourhood::where('slug', 'riverdale')->value('id'),
            'open_to' => ['co_founding'],
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => now(),
            'last_active_at' => now(),
        ]);
        app(BuilderSearchText::class)->refresh($builder->id);

        return $builder;
    }

    private function block(User $as, Builder $builder)
    {
        return $this->actingAs($as)->putJson("/api/v1/blocks/{$builder->public_id}");
    }

    /** @return list<string> */
    private function directoryNames(User $as): array
    {
        return array_column($this->actingAs($as)->getJson('/api/v1/builders?distance=any')->assertOk()->json('items'), 'name');
    }

    public function test_blocking_hides_both_members_from_each_other(): void
    {
        Notification::fake();

        $this->block($this->amara, $this->daniel)->assertOk()->assertJsonPath('builder_id', $this->daniel->public_id);

        $this->assertNotContains('Daniel Reyes', $this->directoryNames($this->amara));
        $this->assertNotContains('Amara Osei', $this->directoryNames($this->daniel->user));
        $amaraBuilder = $this->amara->builder()->first();
        $this->actingAs($this->amara)->getJson("/api/v1/builders/{$this->daniel->public_id}")->assertNotFound();
        $this->actingAs($this->daniel->user)->getJson("/api/v1/builders/{$amaraBuilder->public_id}")->assertNotFound();
        $facets = $this->actingAs($this->amara)->getJson('/api/v1/builders?distance=any')->json('meta.facets.role');
        $this->assertSame(0, $facets['engineer']);
        Notification::assertNothingSent();
    }

    public function test_blocking_twice_changes_nothing(): void
    {
        $this->block($this->amara, $this->daniel)->assertOk();
        $this->block($this->amara, $this->daniel)->assertOk();

        $this->assertSame(1, Block::count());
    }

    public function test_a_member_cannot_block_themselves(): void
    {
        $own = $this->amara->builder()->first();

        $this->block($this->amara, $own)->assertStatus(422)->assertJson(['code' => 'cannot_block_self']);
    }

    public function test_a_builder_who_already_blocked_you_cannot_be_found_to_block(): void
    {
        $amaraBuilder = $this->amara->builder()->first();
        $this->block($this->daniel->user, $amaraBuilder)->assertOk();

        $this->block($this->amara, $this->daniel)->assertNotFound();
        $this->actingAs($this->amara)->putJson('/api/v1/blocks/01jb0000000000000000000000')->assertNotFound();
    }

    public function test_the_blocked_list_shows_the_members_own_blocks_newest_first(): void
    {
        $grace = $this->builder('Grace Liu');
        $this->travel(-1)->hours();
        $this->block($this->amara, $this->daniel)->assertOk();
        $this->travelBack();
        $this->block($this->amara, $grace)->assertOk();
        $this->block($this->daniel->user, $grace)->assertOk();

        $list = $this->actingAs($this->amara)->getJson('/api/v1/blocks')->assertOk()->json();

        $this->assertSame(['Grace Liu', 'Daniel Reyes'], array_column($list, 'name'));
        $this->assertSame(['builder_id', 'name', 'photo_url', 'blocked_at'], array_keys($list[0]));
    }

    public function test_unblocking_restores_visibility_unless_the_other_member_blocked_too(): void
    {
        $this->block($this->amara, $this->daniel)->assertOk();

        $this->actingAs($this->amara)->deleteJson("/api/v1/blocks/{$this->daniel->public_id}")->assertNoContent();

        $this->assertContains('Daniel Reyes', $this->directoryNames($this->amara));
        $this->assertContains('Amara Osei', $this->directoryNames($this->daniel->user));
        $this->actingAs($this->amara)->deleteJson("/api/v1/blocks/{$this->daniel->public_id}")->assertNotFound();

        $amaraBuilder = $this->amara->builder()->first();
        $this->block($this->amara, $this->daniel)->assertOk();
        $this->block($this->daniel->user, $amaraBuilder)->assertNotFound();
    }

    public function test_profiles_offer_block_to_members_viewing_someone_else(): void
    {
        $this->actingAs($this->amara)->getJson("/api/v1/builders/{$this->daniel->public_id}")
            ->assertJsonPath('actions.block', true);
        $own = $this->amara->builder()->first();
        $this->actingAs($this->amara)->getJson("/api/v1/builders/{$own->public_id}")
            ->assertJsonPath('actions.block', false);
    }

    public function test_blocking_needs_a_signed_in_member(): void
    {
        $this->putJson("/api/v1/blocks/{$this->daniel->public_id}")->assertUnauthorized();
        $this->getJson('/api/v1/blocks')->assertUnauthorized();
    }
}
