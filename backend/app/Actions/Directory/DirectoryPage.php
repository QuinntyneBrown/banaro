<?php

namespace App\Actions\Directory;

use App\Models\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * One page of directory results, where it sits in the whole (L2-009 criteria 1 and 5), and for a
 * member the option counts and the distance limit in force (L2-010).
 */
final class DirectoryPage
{
    /**
     * @param  Collection<int, Builder>  $items
     * @param  array<string, mixed>|null  $facets
     */
    public function __construct(
        public readonly Collection $items,
        public readonly int $total,
        public readonly int $page,
        public readonly int $perPage,
        public readonly int $lastPage,
        public readonly ?array $facets = null,
        public readonly ?int $distanceKm = null,
    ) {}
}
