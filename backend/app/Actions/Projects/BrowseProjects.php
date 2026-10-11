<?php

namespace App\Actions\Projects;

use App\Models\Project;
use App\Models\User;
use App\Services\Directory\SearchNormalizer;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Database\Eloquent\Collection;

/**
 * One page of projects, most recently active first (L2-015). Search matches name and summary by word
 * prefix; stages and roles each match any of their values, and all filters apply together. Projects of
 * a member blocked either way are left out (L2-032).
 */
class BrowseProjects
{
    public function __construct(
        private readonly SearchNormalizer $normalizer,
        private readonly BlockService $blocks,
    ) {}

    /**
     * @param  list<string>  $stages
     * @param  list<string>  $roles
     * @return array{items: Collection<int, Project>, total: int, page: int, last_page: int}
     */
    public function handle(?User $viewer, ?string $term, array $stages, array $roles, int $page, int $perPage): array
    {
        $query = Project::query();
        if ($viewer !== null) {
            $this->blocks->applyScope($query, $viewer->id, 'projects.owner_id');
        }
        $tsQuery = $term === null ? null : $this->normalizer->prefixQuery($term);
        if ($term !== null && trim($term) !== '' && $tsQuery === null) {
            $query->whereRaw('false');
        } elseif ($tsQuery !== null) {
            $query->whereRaw("to_tsvector('simple', projects.search_text) @@ to_tsquery('simple', ?)", [$tsQuery]);
        }
        if ($stages !== []) {
            $query->whereIn('projects.stage', $stages);
        }
        if ($roles !== []) {
            $query->whereExists(fn ($q) => $q->selectRaw('1')
                ->from('project_looking_for')
                ->whereColumn('project_looking_for.project_id', 'projects.id')
                ->whereIn('project_looking_for.role', $roles));
        }

        $total = (clone $query)->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);
        $items = $query->with('owner.builder')
            ->orderByDesc('projects.last_activity_at')
            ->orderByDesc('projects.id')
            ->forPage($page, $perPage)
            ->get();

        return ['items' => $items, 'total' => $total, 'page' => $page, 'last_page' => $lastPage];
    }
}
