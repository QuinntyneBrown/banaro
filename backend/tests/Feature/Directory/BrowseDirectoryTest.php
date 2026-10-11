<?php

// Acceptance Test
// Traces to: L2-009, L2-022, L2-044, L2-045, L2-047
// Description:
// Given builders with finished profiles, when a member opens the directory, then it returns 12 per
// page with the total and, for each builder, the card a member sees: photo, name, role, neighbourhood,
// distance, match score, skills, what they are building, what they are open to and online status.
// The viewer and unfinished profiles are left out. Best match (the default) orders by score, then by
// recent activity; Nearest, Recently active and Newest re-order. Search matches names and skills case-
// and accent-insensitively and by prefix. A page past the end answers with the last page. A visitor
// gets the reduced card without match, distance, online status or facts, and only the sorts that need
// no viewer. Signed-in requests record activity at most once a minute.

namespace Tests\Feature\Directory;

use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Skill;
use App\Models\User;
use App\Services\Directory\BuilderSearchText;
use App\Services\Matching\MatchScoreService;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrowseDirectoryTest extends TestCase
{
    use RefreshDatabase;

    private User $viewer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        Carbon::setTestNow('2026-10-11 12:00:00');
        $this->viewer = $this->builder('Amara Osei', 'leslieville', activeMinutesAgo: 0)->user;
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /** @param  list<string>  $skills */
    private function builder(
        string $name,
        string $hood,
        array $skills = [],
        ?int $activeMinutesAgo = null,
        ?string $joined = null,
        bool $complete = true,
        array $extra = [],
    ): Builder {
        $user = User::factory()->create(['name' => $name]);
        $builder = Builder::create(array_merge([
            'user_id' => $user->id,
            'name' => $name,
            'role' => 'engineer',
            'headline' => "{$name} headline",
            'neighbourhood_id' => Neighbourhood::where('slug', $hood)->value('id'),
            'open_to' => ['co_founding'],
            'building_summary' => null,
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => $complete ? now() : null,
            'last_active_at' => $activeMinutesAgo === null ? null : now()->subMinutes($activeMinutesAgo),
        ], $extra));
        $builder->forceFill(['created_at' => $joined ? Carbon::parse($joined) : now()])->save();
        foreach (array_values($skills) as $i => $skill) {
            $model = Skill::firstOrCreate(
                ['normalized_name' => Skill::normalize($skill)],
                ['name' => $skill, 'slug' => Str::slug($skill), 'is_catalogue' => false],
            );
            $builder->skills()->attach($model->id, ['position' => $i + 1]);
        }
        app(BuilderSearchText::class)->refresh($builder->id);

        return $builder->fresh();
    }

    private function browse(array $query = [], bool $asMember = true)
    {
        $request = $asMember ? $this->actingAs($this->viewer) : $this;

        return $request->getJson('/api/v1/builders?'.http_build_query($query));
    }

    /** @return list<string> */
    private function names($response): array
    {
        return array_column($response->json('items'), 'name');
    }

    public function test_a_member_sees_twelve_member_cards_with_the_total_leaving_out_themselves_and_unfinished_profiles(): void
    {
        for ($i = 1; $i <= 13; $i++) {
            $this->builder("Builder {$i}", 'riverdale', activeMinutesAgo: $i * 60);
        }
        $this->builder('Not Finished', 'riverdale', complete: false);

        $response = $this->browse();

        $response->assertOk()->assertJson(['total' => 13, 'page' => 1, 'per_page' => 12, 'last_page' => 2]);
        $this->assertCount(12, $response->json('items'));
        $this->assertNotContains('Amara Osei', $this->names($response));
        $this->assertNotContains('Not Finished', $this->names($response));
    }

    public function test_the_member_card_carries_every_fact(): void
    {
        $daniel = $this->builder('Daniel Reyes', 'riverdale', ['Laravel', 'Angular', 'PostgreSQL'], activeMinutesAgo: 2, extra: [
            'headline' => 'Full-stack engineer',
            'building_summary' => 'Psalter',
            'open_to' => ['co_founding', 'advising'],
        ]);

        $card = $this->browse()->json('items.0');

        $this->assertSame($daniel->public_id, $card['id']);
        $this->assertSame('Daniel Reyes', $card['name']);
        $this->assertSame('engineer', $card['role']);
        $this->assertSame('Full-stack engineer', $card['headline']);
        $this->assertSame(['name' => 'Riverdale', 'area' => 'Downtown Toronto'], $card['neighbourhood']);
        $this->assertEqualsWithDelta(1.4, $card['distance_km'], 0.2);
        $this->assertIsInt($card['match_score']);
        $this->assertSame(['Laravel', 'Angular', 'PostgreSQL'], $card['skills']);
        $this->assertSame('Psalter', $card['building']);
        $this->assertSame(['co_founding', 'advising'], $card['open_to']);
        $this->assertTrue($card['online']);
        $this->assertSame(now()->subMinutes(2)->toIso8601String(), $card['last_seen_at']);
        $this->assertNull($card['photo_url']);
    }

    public function test_best_match_is_the_default_and_orders_by_score_then_recent_activity(): void
    {
        $this->builder('Near and active', 'riverdale', activeMinutesAgo: 10);
        $this->builder('Far and active', 'oakville', activeMinutesAgo: 10);
        $this->builder('Near and idle', 'riverdale', activeMinutesAgo: 60 * 24 * 90);
        $this->builder('Same score, less recent', 'riverdale', activeMinutesAgo: 20);

        $response = $this->browse();

        $items = collect($response->json('items'))->keyBy('name');
        $scores = array_column($response->json('items'), 'match_score');
        $this->assertSame($scores, collect($scores)->sortDesc()->values()->all());
        // Equal scores fall back to the most recently active first.
        $this->assertSame($items['Near and active']['match_score'], $items['Same score, less recent']['match_score']);
        $this->assertSame(['Near and active', 'Same score, less recent'], array_slice($this->names($response), 0, 2));
        // Each score is the one the matching service gives that builder.
        foreach (['Far and active', 'Near and idle'] as $name) {
            $this->assertSame(
                app(MatchScoreService::class)->scoreFor($this->viewer->builder()->first(), Builder::where('name', $name)->first())->value,
                $items[$name]['match_score'],
            );
        }
        $this->assertGreaterThan($items['Far and active']['match_score'], $items['Near and active']['match_score']);
        $this->assertGreaterThan($items['Near and idle']['match_score'], $items['Near and active']['match_score']);
    }

    public function test_nearest_recently_active_and_newest_reorder_the_results(): void
    {
        $this->builder('Oakville builder', 'oakville', activeMinutesAgo: 1, joined: '2026-09-01');
        $this->builder('Riverdale builder', 'riverdale', activeMinutesAgo: 300, joined: '2026-10-01');
        $this->builder('Annex builder', 'the-annex', activeMinutesAgo: 30, joined: '2026-08-01');

        $this->assertSame(['Riverdale builder', 'Annex builder', 'Oakville builder'], $this->names($this->browse(['sort' => 'nearest'])));
        $this->assertSame(['Oakville builder', 'Annex builder', 'Riverdale builder'], $this->names($this->browse(['sort' => 'recently_active'])));
        $this->assertSame(['Riverdale builder', 'Oakville builder', 'Annex builder'], $this->names($this->browse(['sort' => 'newest'])));
    }

    public function test_search_matches_names_and_skills_by_prefix_without_regard_to_case_or_accents(): void
    {
        $this->builder('José Martín', 'riverdale', ['Product strategy']);
        $this->builder('Daniel Reyes', 'riverdale', ['Laravel']);
        $this->builder('Esther Nguyen', 'riverdale', ['Figma']);

        $this->assertSame(['José Martín'], $this->names($this->browse(['q' => 'jose'])));
        $this->assertSame(['José Martín'], $this->names($this->browse(['q' => 'MARTIN'])));
        $this->assertSame(['Daniel Reyes'], $this->names($this->browse(['q' => 'dan'])));
        $this->assertSame(['Daniel Reyes'], $this->names($this->browse(['q' => 'larav'])));
        $this->assertSame(['José Martín'], $this->names($this->browse(['q' => 'product strat'])));
        $this->assertSame([], $this->names($this->browse(['q' => "'; drop table builders; --"])));
    }

    public function test_saving_a_profile_refreshes_what_search_finds(): void
    {
        $this->builder('Esther Nguyen', 'riverdale', ['Figma']);
        $esther = User::where('name', 'Esther Nguyen')->first();

        $this->actingAs($esther)->putJson('/api/v1/me/profile', [
            'name' => 'Esther Nguyen',
            'headline' => null,
            'neighbourhood_id' => Neighbourhood::where('slug', 'riverdale')->value('id'),
            'bio' => null,
            'skills' => [['name' => 'Rust']],
            'experience' => [],
            'links' => [],
            'open_to' => ['advising'],
            'looking_for' => null,
            'building' => null,
        ])->assertOk();

        $this->assertSame(['Esther Nguyen'], $this->names($this->browse(['q' => 'rust'])));
        $this->assertSame([], $this->names($this->browse(['q' => 'figma'])));
    }

    public function test_a_page_past_the_end_answers_with_the_last_page(): void
    {
        for ($i = 1; $i <= 14; $i++) {
            $this->builder("Builder {$i}", 'riverdale', activeMinutesAgo: $i);
        }

        $response = $this->browse(['page' => 9, 'sort' => 'recently_active']);

        $response->assertOk()->assertJson(['page' => 2, 'last_page' => 2, 'total' => 14]);
        $this->assertSame(['Builder 13', 'Builder 14'], $this->names($response));
    }

    public function test_a_visitor_gets_the_reduced_card_and_only_sorts_that_need_no_viewer(): void
    {
        $this->builder('Daniel Reyes', 'riverdale', ['Laravel'], activeMinutesAgo: 2, extra: ['building_summary' => 'Psalter']);

        $response = $this->browse([], asMember: false);

        $response->assertOk();
        $card = collect($response->json('items'))->firstWhere('name', 'Daniel Reyes');
        $this->assertSame(['id', 'name', 'role', 'headline', 'neighbourhood', 'skills', 'photo_url'], array_keys($card));
        $this->assertSame(['name' => 'Riverdale', 'area' => 'Downtown Toronto'], $card['neighbourhood']);
        $this->browse(['sort' => 'newest'], asMember: false)->assertOk();
        $this->browse(['sort' => 'best_match'], asMember: false)->assertStatus(422)->assertJsonValidationErrors('sort');
        $this->browse(['sort' => 'nearest'], asMember: false)->assertStatus(422)->assertJsonValidationErrors('sort');
    }

    public function test_invalid_queries_are_rejected(): void
    {
        $this->browse(['sort' => 'alphabetical'])->assertStatus(422)->assertJsonValidationErrors('sort');
        $this->browse(['page' => 0])->assertStatus(422)->assertJsonValidationErrors('page');
        $this->browse(['per_page' => 51])->assertStatus(422)->assertJsonValidationErrors('per_page');
        $this->browse(['q' => str_repeat('a', 101)])->assertStatus(422)->assertJsonValidationErrors('q');
    }

    public function test_signed_in_requests_record_activity_at_most_once_a_minute(): void
    {
        $daniel = $this->builder('Daniel Reyes', 'riverdale', activeMinutesAgo: 600);

        Carbon::setTestNow('2026-10-11 12:00:30');
        $this->actingAs($daniel->user)->getJson('/api/v1/session')->assertOk();
        $this->assertSame('2026-10-11 12:00:30', $daniel->fresh()->last_active_at->format('Y-m-d H:i:s'));

        Carbon::setTestNow('2026-10-11 12:01:00');
        $this->actingAs($daniel->user)->getJson('/api/v1/session')->assertOk();
        $this->assertSame('2026-10-11 12:00:30', $daniel->fresh()->last_active_at->format('Y-m-d H:i:s'));

        Carbon::setTestNow('2026-10-11 12:01:31');
        $this->actingAs($daniel->user)->getJson('/api/v1/session')->assertOk();
        $this->assertSame('2026-10-11 12:01:31', $daniel->fresh()->last_active_at->format('Y-m-d H:i:s'));
    }
}
