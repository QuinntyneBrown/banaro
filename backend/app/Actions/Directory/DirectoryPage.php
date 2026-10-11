<?php

namespace App\Actions\Directory;

use App\Models\Builder;
use Illuminate\Database\Eloquent\Collection;

/** One page of directory results and where it sits in the whole (L2-009 criteria 1 and 5). */
final class DirectoryPage
{
    /** @param  Collection<int, Builder>  $items */
    public function __construct(
        public readonly Collection $items,
        public readonly int $total,
        public readonly int $page,
        public readonly int $perPage,
        public readonly int $lastPage,
    ) {}
}
