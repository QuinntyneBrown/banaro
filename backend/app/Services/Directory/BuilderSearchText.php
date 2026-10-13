<?php

namespace App\Services\Directory;

use App\Models\Builder;

/**
 * Rewrites a builder's search text from their name, headline, skills and what they are building, so
 * the directory finds them by any of these (L2-009 criterion 4). Project names join it when projects
 * exist.
 */
class BuilderSearchText
{
    public function __construct(private readonly SearchNormalizer $normalizer) {}

    public function refresh(int $builderId): void
    {
        $builder = Builder::with('skills')->find($builderId);
        if ($builder === null) {
            return;
        }
        $parts = [$builder->name, $builder->headline, $builder->building_summary, ...$builder->skills->pluck('name')];
        $text = $this->normalizer->normalize(implode(' ', array_filter($parts)));
        Builder::whereKey($builder->id)->update(['search_text' => $text]);
    }
}
