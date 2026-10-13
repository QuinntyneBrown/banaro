<?php

namespace App\Services\Directory;

use Illuminate\Support\Facades\DB;

/** Kilometres between neighbourhood centroids, from the precomputed table (L2-009). */
class DistanceService
{
    public function between(?int $fromNeighbourhoodId, ?int $toNeighbourhoodId): ?float
    {
        if ($fromNeighbourhoodId === null || $toNeighbourhoodId === null) {
            return null;
        }
        $km = DB::table('neighbourhood_distances')
            ->where('from_id', $fromNeighbourhoodId)
            ->where('to_id', $toNeighbourhoodId)
            ->value('km');

        return $km === null ? null : (float) $km;
    }
}
