<?php

namespace App\Actions\Directory;

use App\Enums\DirectorySort;
use App\Models\Builder;
use App\Services\Directory\SearchNormalizer;
use App\Services\Matching\MatchScoreService;
use Illuminate\Database\Eloquent\Builder as Query;
use Illuminate\Database\Query\JoinClause;

/**
 * One page of the builder directory (L2-009): finished profiles other than the viewer, matched
 * against the search term, ordered by the chosen sort with the builder id breaking ties, and clamped
 * to the last page. For a member each row carries its distance and match score.
 */
class SearchDirectory
{
    public function __construct(
        private readonly SearchNormalizer $normalizer,
        private readonly MatchScoreService $scores,
    ) {}

    public function handle(?Builder $viewer, ?string $term, DirectorySort $sort, int $page, int $perPage): DirectoryPage
    {
        $query = Builder::query()->whereNotNull('builders.onboarding_completed_at');
        if ($viewer !== null) {
            $query->where('builders.id', '!=', $viewer->id);
        }
        $tsQuery = $term === null ? null : $this->normalizer->prefixQuery($term);
        if ($term !== null && trim($term) !== '' && $tsQuery === null) {
            // Nothing searchable is left of the term, so nothing can match it.
            $query->whereRaw('false');
        } elseif ($tsQuery !== null) {
            $query->whereRaw("to_tsvector('simple', builders.search_text) @@ to_tsquery('simple', ?)", [$tsQuery]);
        }

        $total = (clone $query)->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);

        $query->select('builders.*')->with(['neighbourhood', 'skills', 'photo']);
        if ($viewer !== null) {
            $this->addViewerColumns($query, $viewer);
        }
        $this->order($query, $sort);

        $items = $query->forPage($page, $perPage)->get();

        return new DirectoryPage($items, $total, $page, $perPage, $lastPage);
    }

    /** @param  Query<Builder>  $query */
    private function addViewerColumns(Query $query, Builder $viewer): void
    {
        $query->leftJoin('neighbourhood_distances as nd', function (JoinClause $join) use ($viewer) {
            $join->on('nd.to_id', '=', 'builders.neighbourhood_id')
                ->where('nd.from_id', '=', $viewer->neighbourhood_id);
        });
        $query->addSelect('nd.km as distance_km');
        $query->selectRaw(
            $this->scores->sqlScore('nd.km', 'builders.last_active_at').' as match_score',
            $this->scores->sqlScoreBindings(),
        );
    }

    /** @param  Query<Builder>  $query */
    private function order(Query $query, DirectorySort $sort): void
    {
        match ($sort) {
            DirectorySort::BestMatch => $query->orderByRaw('match_score DESC')
                ->orderByRaw('builders.last_active_at DESC NULLS LAST'),
            DirectorySort::Nearest => $query->orderByRaw('nd.km ASC NULLS LAST'),
            DirectorySort::RecentlyActive => $query->orderByRaw('builders.last_active_at DESC NULLS LAST'),
            DirectorySort::Newest => $query->orderByDesc('builders.created_at'),
        };
        $query->orderBy('builders.id');
    }
}
