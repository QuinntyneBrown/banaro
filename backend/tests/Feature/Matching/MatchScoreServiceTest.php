<?php

// Acceptance Test
// Traces to: L2-022
// Description: Given a viewer and a candidate, when the match score is computed, then it is an integer
// 0–100 from the documented factors and weights: distance (1 at 0 km, 0 at 40 km) and recent activity
// (1 within 7 days, 0 from 60 days). Without matching preferences, skill complement and open-to
// alignment do not count and the other two weights fill the whole (D-041).

namespace Tests\Feature\Matching;

use App\Models\Builder;
use App\Services\Directory\DistanceService;
use App\Services\Matching\MatchScoreService;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class MatchScoreServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-10-11 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function score(?float $km, ?Carbon $lastActive): int
    {
        $this->app->instance(DistanceService::class, new class($km) extends DistanceService
        {
            public function __construct(private readonly ?float $km) {}

            public function between(?int $from, ?int $to): ?float
            {
                return $this->km;
            }
        });
        $viewer = new Builder(['neighbourhood_id' => 1]);
        $candidate = new Builder(['neighbourhood_id' => 2, 'last_active_at' => $lastActive]);

        return app(MatchScoreService::class)->scoreFor($viewer, $candidate)->value;
    }

    public function test_the_weights_are_documented_in_configuration(): void
    {
        $this->assertSame(
            ['skill_complement' => 0.35, 'open_to' => 0.30, 'distance' => 0.20, 'recent_activity' => 0.15],
            config('banaro.matching.score_weights'),
        );
    }

    public function test_next_door_and_active_this_week_scores_100(): void
    {
        $this->assertSame(100, $this->score(0.0, now()->subDays(3)));
    }

    public function test_at_the_distance_limit_and_long_idle_scores_0(): void
    {
        $this->assertSame(0, $this->score(40.0, now()->subDays(60)));
        $this->assertSame(0, $this->score(75.0, null));
        $this->assertSame(0, $this->score(null, null));
    }

    public function test_distance_falls_linearly_to_the_limit(): void
    {
        // 0.20 × 0.5 + 0.15 × 1, over 0.35.
        $this->assertSame(71, $this->score(20.0, now()));
        $this->assertSame(86, $this->score(10.0, now()));
    }

    public function test_activity_falls_linearly_from_seven_to_sixty_days(): void
    {
        // Halfway: 33.5 days → 0.5. 0.20 × 1 + 0.15 × 0.5, over 0.35.
        $this->assertSame(79, $this->score(0.0, now()->subHours((int) (33.5 * 24))));
        $this->assertSame(100, $this->score(0.0, now()->subDays(7)));
        $this->assertSame(57, $this->score(0.0, now()->subDays(61)));
    }
}
