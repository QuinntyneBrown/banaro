<?php

namespace App\Actions\Directory;

use App\Enums\DirectorySort;
use App\Models\Builder;
use App\Services\Directory\DirectoryFilters;
use App\Services\Directory\FacetCounter;
use App\Services\Directory\SearchNormalizer;
use App\Services\Matching\MatchScoreService;
use App\Services\Settings\ProfileVisibilityService;
use Illuminate\Database\Eloquent\Builder as Query;
use Illuminate\Database\Query\JoinClause;

/**
 * One page of the builder directory (L2-009, L2-010): finished profiles other than the viewer,
 * matched against the search term and the filters, ordered by the chosen sort with the builder id
 * breaking ties, and clamped to the last page. For a member each row carries its distance and match
 * score, and the page carries the option counts.
 */
class SearchDirectory
{
    public function __construct(
        private readonly SearchNormalizer $normalizer,
        private readonly MatchScoreService $scores,
        private readonly FacetCounter $facets,
        private readonly ProfileVisibilityService $visibility,
    ) {}

    public function handle(
        ?Builder $viewer,
        ?string $term,
        DirectorySort $sort,
        int $page,
        int $perPage,
        DirectoryFilters $filters = new DirectoryFilters,
    ): DirectoryPage {
        $query = $this->filtered($viewer, $term, $filters);

        $total = (clone $query)->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);

        $query->select('builders.*')->with(['neighbourhood', 'skills', 'photo', 'privacy']);
        if ($viewer !== null) {
            $distance = $this->visibility->sqlDistance('nd.km');
            $query->selectRaw("{$distance} as distance_km");
            $query->selectRaw(
                $this->scores->sqlScore($distance, 'builders.last_active_at').' as match_score',
                $this->scores->sqlScoreBindings(),
            );
        }
        $this->order($query, $sort);
        $items = $query->forPage($page, $perPage)->get();

        $facets = $viewer === null
            ? null
            : $this->facets->count(fn (DirectoryFilters $f) => $this->filtered($viewer, $term, $f), $filters);

        return new DirectoryPage($items, $total, $page, $perPage, $lastPage, $facets, $filters->distanceKm);
    }

    /**
     * The scoped, searched and filtered builders, with the viewer's distances joined as `nd`.
     *
     * @return Query<Builder>
     */
    private function filtered(?Builder $viewer, ?string $term, DirectoryFilters $filters): Query
    {
        $query = Builder::query()->whereNotNull('builders.onboarding_completed_at');
        // Privacy: members-only profiles stay out of the signed-out directory (L2-036).
        $this->visibility->joinSettings($query);
        $this->visibility->applyScope($query, signedIn: $viewer !== null);
        if ($viewer !== null) {
            $query->where('builders.id', '!=', $viewer->id);
            $query->leftJoin('neighbourhood_distances as nd', function (JoinClause $join) use ($viewer) {
                $join->on('nd.to_id', '=', 'builders.neighbourhood_id')
                    ->where('nd.from_id', '=', $viewer->neighbourhood_id);
            });
        }

        $tsQuery = $term === null ? null : $this->normalizer->prefixQuery($term);
        if ($term !== null && trim($term) !== '' && $tsQuery === null) {
            // Nothing searchable is left of the term, so nothing can match it.
            $query->whereRaw('false');
        } elseif ($tsQuery !== null) {
            $query->whereRaw("to_tsvector('simple', builders.search_text) @@ to_tsquery('simple', ?)", [$tsQuery]);
        }

        // Each group is one clause, so its options combine with OR and the groups with AND.
        if ($filters->roles !== []) {
            $query->whereIn('builders.role', $filters->roles);
        }
        if ($filters->openTo !== []) {
            $query->whereRaw('jsonb_exists_any(builders.open_to, ?::text[])', ['{'.implode(',', $filters->openTo).'}']);
        }
        if ($filters->areas !== []) {
            $query->whereIn('builders.neighbourhood_id', fn ($q) => $q->select('id')->from('neighbourhoods')->whereIn('area', $filters->areas));
        }
        if ($filters->skills !== []) {
            $query->whereExists(fn ($q) => $q->selectRaw('1')
                ->from('builder_skill')
                ->join('skills', 'skills.id', '=', 'builder_skill.skill_id')
                ->whereColumn('builder_skill.builder_id', 'builders.id')
                ->whereIn('skills.slug', $filters->skills));
        }
        if ($viewer !== null && $filters->distanceKm !== null) {
            $query->whereRaw($this->visibility->sqlDistance('nd.km').' <= ?', [$filters->distanceKm]);
        }

        return $query;
    }

    /** @param  Query<Builder>  $query */
    private function order(Query $query, DirectorySort $sort): void
    {
        match ($sort) {
            DirectorySort::BestMatch => $query->orderByRaw('match_score DESC')
                ->orderByRaw('builders.last_active_at DESC NULLS LAST'),
            DirectorySort::Nearest => $query->orderByRaw($this->visibility->sqlDistance('nd.km').' ASC NULLS LAST'),
            DirectorySort::RecentlyActive => $query->orderByRaw('builders.last_active_at DESC NULLS LAST'),
            DirectorySort::Newest => $query->orderByDesc('builders.created_at'),
        };
        $query->orderBy('builders.id');
    }
}
