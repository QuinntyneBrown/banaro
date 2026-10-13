<?php

namespace App\Services\Directory;

/**
 * The directory's facet filters (L2-010). Options within a group combine with OR, groups with AND.
 * The distance limit is in kilometres; null means anywhere (always the case for visitors).
 */
final class DirectoryFilters
{
    public const DEFAULT_DISTANCE_KM = 40;

    public const DISTANCES = ['5', '10', '25', '40', 'any'];

    /**
     * @param  list<string>  $roles
     * @param  list<string>  $openTo
     * @param  list<string>  $areas
     * @param  list<string>  $skills  skill slugs
     */
    public function __construct(
        public readonly array $roles = [],
        public readonly array $openTo = [],
        public readonly array $areas = [],
        public readonly array $skills = [],
        public readonly ?int $distanceKm = null,
    ) {}

    /** The filters with one group cleared, for counting that group's options. */
    public function without(string $group): self
    {
        return new self(
            $group === 'role' ? [] : $this->roles,
            $group === 'open_to' ? [] : $this->openTo,
            $group === 'area' ? [] : $this->areas,
            $group === 'skills' ? [] : $this->skills,
            $this->distanceKm,
        );
    }
}
