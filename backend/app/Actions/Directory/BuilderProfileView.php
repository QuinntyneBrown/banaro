<?php

namespace App\Actions\Directory;

use App\Models\Builder;
use App\Services\Matching\MatchScore;

/** A builder's profile for one viewer: the distance and match they may see (L2-011). */
final class BuilderProfileView
{
    public function __construct(
        public readonly Builder $builder,
        public readonly ?Builder $viewer,
        public readonly bool $isOwn,
        public readonly ?float $distanceKm = null,
        public readonly ?MatchScore $match = null,
    ) {}
}
