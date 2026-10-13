<?php

namespace App\Services\Directory;

use App\Enums\BuilderRole;
use App\Enums\OpenTo;
use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Skill;
use Closure;
use Illuminate\Database\Eloquent\Builder as Query;

/**
 * Option counts for the directory filters (L2-010 criterion 1). Each group's options are counted
 * among builders matching every other group, from the same scoped query as the results, so a builder
 * left out of the results is never counted.
 */
class FacetCounter
{
    /**
     * @param  Closure(DirectoryFilters): Query<Builder>  $filtered
     * @return array{role: array<string, int>, open_to: array<string, int>, area: array<string, int>, skills: list<array{slug: string, name: string, count: int}>}
     */
    public function count(Closure $filtered, DirectoryFilters $filters): array
    {
        $roles = $filtered($filters->without('role'))
            ->selectRaw('builders.role as option, count(*) as n')
            ->groupBy('builders.role')
            ->pluck('n', 'option');

        $openToBase = $filtered($filters->without('open_to'));
        $openTo = [];
        foreach (OpenTo::cases() as $case) {
            $openTo[$case->value] = (clone $openToBase)->whereRaw('jsonb_exists(builders.open_to, ?)', [$case->value])->count();
        }

        $areas = $filtered($filters->without('area'))
            ->join('neighbourhoods as fh', 'fh.id', '=', 'builders.neighbourhood_id')
            ->selectRaw('fh.area as option, count(*) as n')
            ->groupBy('fh.area')
            ->pluck('n', 'option');

        $skills = $filtered($filters->without('skills'))
            ->join('builder_skill as fbs', 'fbs.builder_id', '=', 'builders.id')
            ->join('skills as fs', 'fs.id', '=', 'fbs.skill_id')
            ->where('fs.is_catalogue', true)
            ->selectRaw('fs.slug as option, count(*) as n')
            ->groupBy('fs.slug')
            ->pluck('n', 'option');

        return [
            'role' => collect(BuilderRole::cases())->mapWithKeys(fn (BuilderRole $r) => [$r->value => (int) ($roles[$r->value] ?? 0)])->all(),
            'open_to' => $openTo,
            'area' => $this->areas()->mapWithKeys(fn (string $area) => [$area => (int) ($areas[$area] ?? 0)])->all(),
            'skills' => Skill::catalogue()->get(['slug', 'name'])
                ->map(fn (Skill $s) => ['slug' => $s->slug, 'name' => $s->name, 'count' => (int) ($skills[$s->slug] ?? 0)])
                ->values()->all(),
        ];
    }

    /** Areas in the order the reference data lists them, as the filter shows them. */
    public function areas()
    {
        return Neighbourhood::query()
            ->selectRaw('area, min(id) as first_id')
            ->groupBy('area')
            ->orderBy('first_id')
            ->pluck('area');
    }
}
