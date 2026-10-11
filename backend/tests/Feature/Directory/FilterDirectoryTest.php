<?php

// Acceptance Test
// Traces to: L2-010, L2-045
// Description:
// Given filters for role, open to, neighbourhood or city, distance and skills, when a member applies
// them, then results match every group (AND) and any value within a group (OR), and each option
// carries its count among builders matching the other groups. Without a distance the member sees
// builders within 40 km of their neighbourhood; 5, 10, 25 and 40 km and "anywhere" change that.
// Values outside the known sets are rejected, and visitors cannot filter (D-044).

namespace Tests\Feature\Directory;

use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Skill;
use App\Models\User;
use App\Services\Directory\BuilderSearchText;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilterDirectoryTest extends TestCase
{
    use RefreshDatabase;

    private User $viewer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ReferenceDataSeeder::class);
        $this->viewer = $this->builder('Amara Osei', 'leslieville', 'founder')->user;
    }

    /**
     * @param  list<string>  $openTo
     * @param  list<string>  $skills  catalogue skill names
     */
    private function builder(string $name, string $hood, string $role, array $openTo = ['co_founding'], array $skills = []): Builder
    {
        $user = User::factory()->create(['name' => $name]);
        $builder = Builder::create([
            'user_id' => $user->id,
            'name' => $name,
            'role' => $role,
            'neighbourhood_id' => Neighbourhood::where('slug', $hood)->value('id'),
            'open_to' => $openTo,
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => now(),
            'last_active_at' => now(),
        ]);
        foreach (array_values($skills) as $i => $skill) {
            $builder->skills()->attach(Skill::where('name', $skill)->value('id'), ['position' => $i + 1]);
        }
        app(BuilderSearchText::class)->refresh($builder->id);

        return $builder;
    }

    private function browse(array $query, ?User $as = null)
    {
        return $this->actingAs($as ?? $this->viewer)->getJson('/api/v1/builders?'.http_build_query($query));
    }

    /** @return list<string> */
    private function names($response): array
    {
        $names = array_column($response->json('items'), 'name');
        sort($names);

        return $names;
    }

    private function cast(): void
    {
        $this->builder('Daniel Reyes', 'riverdale', 'engineer', ['co_founding'], ['Laravel', 'Angular']);
        $this->builder('Grace Liu', 'markham', 'designer', ['contributing'], ['Figma']);
        $this->builder('Noah Fischer', 'the-annex', 'engineer', ['advising', 'contributing'], ['Swift']);
        $this->builder('Ruth Alvarez', 'scarborough', 'founder', ['co_founding', 'advising'], ['Product strategy']);
    }

    public function test_options_within_a_group_combine_with_or_and_groups_with_and(): void
    {
        $this->cast();

        $this->assertSame(['Daniel Reyes', 'Grace Liu', 'Noah Fischer'], $this->names($this->browse(['role' => ['engineer', 'designer']])));
        $this->assertSame(['Grace Liu', 'Noah Fischer'], $this->names($this->browse(['role' => ['engineer', 'designer'], 'open_to' => ['contributing']])));
        $this->assertSame(['Daniel Reyes', 'Noah Fischer'], $this->names($this->browse(['area' => ['Downtown Toronto']])));
        $this->assertSame(['Daniel Reyes', 'Grace Liu'], $this->names($this->browse(['skills' => ['laravel', 'figma']])));
        $this->assertSame(['Noah Fischer', 'Ruth Alvarez'], $this->names($this->browse(['open_to' => ['advising']])));
    }

    public function test_each_option_counts_builders_matching_the_other_groups(): void
    {
        $this->cast();

        $facets = $this->browse(['role' => ['engineer'], 'open_to' => ['contributing']])->json('meta.facets');

        // Role counts ignore the role filter but keep "open to contributing".
        $this->assertSame(['founder' => 0, 'engineer' => 1, 'designer' => 1, 'product_manager' => 0, 'other' => 0], $facets['role']);
        // Open-to counts keep the engineer filter.
        $this->assertSame(['co_founding' => 1, 'advising' => 1, 'contributing' => 1], $facets['open_to']);
        // Area and skill counts keep both filters.
        $this->assertSame(1, $facets['area']['Downtown Toronto']);
        $this->assertSame(0, $facets['area']['Markham']);
        $skills = collect($facets['skills'])->keyBy('slug');
        $this->assertSame(['slug' => 'swift', 'name' => 'Swift', 'count' => 1], $skills['swift']);
        $this->assertSame(0, $skills['laravel']['count']);
        $this->assertCount(12, $facets['skills']);
    }

    public function test_without_a_distance_members_see_builders_within_40_km(): void
    {
        $oakville = $this->builder('Joel Tanaka', 'oakville', 'engineer')->user;
        $this->builder('Near Ajax', 'ajax', 'engineer');
        $this->builder('Mid Mississauga', 'mississauga', 'engineer');
        $this->builder('Next door', 'oakville', 'engineer');

        $default = $this->browse([], $oakville);
        $this->assertSame(['Mid Mississauga', 'Next door'], array_values(array_diff($this->names($default), ['Amara Osei'])));
        $this->assertSame(40, $default->json('meta.distance_km'));

        $this->assertNotContains('Mid Mississauga', $this->names($this->browse(['distance' => '5'], $oakville)));
        $this->assertContains('Next door', $this->names($this->browse(['distance' => '5'], $oakville)));
        $anywhere = $this->browse(['distance' => 'any'], $oakville);
        $this->assertContains('Near Ajax', $this->names($anywhere));
        $this->assertNull($anywhere->json('meta.distance_km'));
    }

    public function test_values_outside_the_known_sets_are_rejected(): void
    {
        $this->browse(['role' => ['astronaut']])->assertStatus(422)->assertJsonValidationErrors('role.0');
        $this->browse(['open_to' => ['hiring']])->assertStatus(422)->assertJsonValidationErrors('open_to.0');
        $this->browse(['area' => ['Atlantis']])->assertStatus(422)->assertJsonValidationErrors('area.0');
        $this->browse(['skills' => ['no-such-skill']])->assertStatus(422)->assertJsonValidationErrors('skills.0');
        $this->browse(['distance' => '7'])->assertStatus(422)->assertJsonValidationErrors('distance');
    }

    public function test_visitors_cannot_filter_and_get_no_counts(): void
    {
        $this->cast();

        $this->getJson('/api/v1/builders?role[]=engineer')->assertStatus(422)->assertJsonValidationErrors('role');
        $response = $this->getJson('/api/v1/builders');
        $response->assertOk();
        $this->assertNull($response->json('meta.facets'));
        $this->assertNull($response->json('meta.distance_km'));
    }
}
