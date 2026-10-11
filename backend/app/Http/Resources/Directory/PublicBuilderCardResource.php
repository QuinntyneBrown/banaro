<?php

namespace App\Http\Resources\Directory;

use App\Models\Builder;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The card a visitor sees: name, role, neighbourhood, skills and photo only. Member-only facts are
 * absent, not null (L2-009 criterion 6).
 *
 * @property-read Builder $resource
 */
class PublicBuilderCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $builder = $this->resource;

        return [
            'id' => $builder->public_id,
            'name' => $builder->name,
            'role' => $builder->role?->value,
            'headline' => $builder->headline,
            'neighbourhood' => $builder->neighbourhood
                ? ['name' => $builder->neighbourhood->name, 'area' => $builder->neighbourhood->area]
                : null,
            'skills' => $builder->skills->map(fn (Skill $s) => $s->name)->values()->all(),
            'photo_url' => $builder->photo?->url(),
        ];
    }
}
