<?php

namespace App\Services\Matching;

use App\Models\Builder;
use App\Services\Directory\DistanceService;
use Illuminate\Support\Carbon;

/**
 * Scores how well a candidate fits the viewer (L2-022 criterion 4). Each factor is 0–1; the score is
 * their weighted mean × 100, rounded and clamped to 0–100. Skill complement and open-to alignment
 * need the viewer's matching preferences (L2-021); until they exist only distance and recent
 * activity count, with their weights scaled up to fill the whole (D-041).
 *
 * The directory ranks many builders at once, so `sqlScore()` gives the same formula as SQL.
 */
class MatchScoreService
{
    public function __construct(private readonly DistanceService $distances) {}

    /**
     * `$shownKm` is the distance the viewer may see (rounded for "City only", L2-036); without it the
     * exact distance between the neighbourhoods is used.
     */
    public function scoreFor(Builder $viewer, Builder $candidate, ?float $shownKm = null): MatchScore
    {
        $km = $shownKm ?? $this->distances->between($viewer->neighbourhood_id, $candidate->neighbourhood_id);
        $distance = $km === null ? 0.0 : max(0.0, 1 - $km / $this->maxKm());
        $activity = $this->activityFactor($candidate->last_active_at);

        [$wd, $wa] = [$this->weight('distance'), $this->weight('recent_activity')];
        $value = (int) round(100 * ($wd * $distance + $wa * $activity) / ($wd + $wa));

        $reasons = [];
        if ($km !== null && $km <= $this->maxKm()) {
            $reasons[] = ['code' => 'nearby', 'km' => round($km, 1)];
        }
        if ($activity >= 1.0) {
            $reasons[] = ['code' => 'recently_active'];
        }

        return new MatchScore(max(0, min(100, $value)), $reasons);
    }

    /**
     * The score as SQL, for ordering. `$km` is an SQL expression for the distance in kilometres
     * (null when unknown) and `$lastActive` one for the candidate's last activity; `?` is bound to
     * the current time.
     */
    public function sqlScore(string $km, string $lastActive): string
    {
        $max = $this->maxKm();
        [$wd, $wa] = [$this->weight('distance'), $this->weight('recent_activity')];
        [$active, $idle] = [$this->activeDays(), $this->idleDays()];
        $days = "(EXTRACT(EPOCH FROM (CAST(? AS timestamp) - {$lastActive})) / 86400.0)";
        $distance = "GREATEST(0, 1 - COALESCE({$km}, {$max}) / {$max})";
        $activity = "(CASE WHEN {$lastActive} IS NULL THEN 0 WHEN {$days} <= {$active} THEN 1 "
            ."WHEN {$days} >= {$idle} THEN 0 ELSE ({$idle} - {$days}) / ".($idle - $active).' END)';

        return "LEAST(100, GREATEST(0, ROUND(100 * ({$wd} * {$distance} + {$wa} * {$activity}) / ".($wd + $wa).')))';
    }

    /** How many times `sqlScore()` binds the current time. */
    public function sqlScoreBindings(): array
    {
        $now = Carbon::now()->format('Y-m-d H:i:s');

        return [$now, $now, $now];
    }

    private function activityFactor(?Carbon $lastActive): float
    {
        if ($lastActive === null) {
            return 0.0;
        }
        $days = $lastActive->diffInSeconds(Carbon::now(), true) / 86400;
        if ($days <= $this->activeDays()) {
            return 1.0;
        }
        if ($days >= $this->idleDays()) {
            return 0.0;
        }

        return ($this->idleDays() - $days) / ($this->idleDays() - $this->activeDays());
    }

    private function weight(string $factor): float
    {
        return (float) config("banaro.matching.score_weights.{$factor}");
    }

    private function maxKm(): float
    {
        return (float) config('banaro.matching.default_max_km');
    }

    private function activeDays(): int
    {
        return (int) config('banaro.matching.active_days');
    }

    private function idleDays(): int
    {
        return (int) config('banaro.matching.idle_days');
    }
}
