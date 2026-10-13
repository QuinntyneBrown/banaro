<?php

namespace App\Http\Resources\Directory;

use App\Models\Builder;
use App\Models\Skill;
use App\Services\Settings\ProfileVisibilityService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The card a visitor sees: name, role, neighbourhood, skills and photo only. Member-only facts are
 * absent, not null (L2-009 criterion 6), and so is the neighbourhood under "City only" (L2-036).
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
            'neighbourhood' => $this->place($builder),
            'skills' => $builder->skills->map(fn (Skill $s) => $s->name)->values()->all(),
            'photo_url' => $builder->photo?->url(),
        ];
    }

    /** The neighbourhood, or only the city (its area) for "City only" (L2-036 criterion 3). */
    protected function place(Builder $builder): ?array
    {
        $hood = $builder->neighbourhood;
        if ($hood === null) {
            return null;
        }
        $cityOnly = app(ProfileVisibilityService::class)->isCityOnly($builder);

        return ['name' => $cityOnly ? $hood->area : $hood->name, 'area' => $hood->area];
    }
}
