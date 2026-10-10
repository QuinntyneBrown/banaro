<?php

namespace App\Http\Resources\Profiles;

use App\Models\Builder;
use App\Models\ExperienceEntry;
use App\Models\Neighbourhood;
use App\Models\ProfileLink;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The member's editable profile and the neighbourhood list the form needs (L2-007).
 *
 * @property-read Builder $resource
 */
class OwnProfileResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $builder = $this->resource->loadMissing(['skills', 'experience', 'links']);

        return [
            'id' => $builder->public_id,
            'name' => $builder->name,
            'headline' => $builder->headline,
            'neighbourhood_id' => $builder->neighbourhood_id,
            'bio' => $builder->bio,
            'photo_url' => null,
            'skills' => $builder->skills->map(fn (Skill $s) => ['id' => $s->id, 'name' => $s->name])->values(),
            'experience' => $builder->experience->map(fn (ExperienceEntry $e) => [
                'title' => $e->title,
                'organization' => $e->organization,
                'started_on' => $e->started_on?->format('Y-m-d'),
                'ended_on' => $e->ended_on?->format('Y-m-d'),
            ])->values(),
            'links' => $builder->links->map(fn (ProfileLink $l) => ['label' => $l->label, 'url' => $l->url])->values(),
            'open_to' => $builder->open_to ?? [],
            'looking_for' => $builder->looking_for,
            'building' => $builder->building_summary,
            'neighbourhoods' => Neighbourhood::orderBy('name')->get(['id', 'name', 'area']),
        ];
    }
}
