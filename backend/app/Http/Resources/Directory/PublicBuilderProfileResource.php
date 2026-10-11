<?php

namespace App\Http\Resources\Directory;

use App\Actions\Directory\BuilderProfileView;
use App\Models\Builder;
use App\Models\Skill;
use App\Services\Settings\ProfileVisibilityService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The profile a visitor sees of a builder open to everyone: the visitor card's fields only
 * (L2-009 criterion 6, D-048). Empty and hidden fields are absent.
 *
 * @property-read BuilderProfileView $resource
 */
class PublicBuilderProfileResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $builder = $this->resource->builder;
        $skills = $builder->skills->map(fn (Skill $s) => $s->name)->values()->all();

        return array_filter([
            'id' => $builder->public_id,
            'name' => $builder->name,
            'role' => $builder->role?->value,
            'headline' => $builder->headline,
            'neighbourhood' => $this->place($builder),
            'skills' => $skills ?: null,
            'photo_url' => $builder->photo?->url(),
            'is_own' => $this->resource->isOwn,
        ], fn ($value, string $key) => $value !== null || in_array($key, ['headline', 'photo_url', 'role'], true), ARRAY_FILTER_USE_BOTH);
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
