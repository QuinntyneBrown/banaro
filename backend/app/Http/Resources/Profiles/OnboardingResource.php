<?php

namespace App\Http\Resources\Profiles;

use App\Enums\BuilderRole;
use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Skill;
use App\Models\User;
use App\Services\Profiles\OnboardingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Onboarding progress: the next step, the saved answers, and the lists the steps choose from.
 *
 * @property-read User $resource
 */
class OnboardingResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $user = $this->resource;
        /** @var Builder|null $builder */
        $builder = $user->builder()->with('skills')->first();

        return [
            'next_step' => app(OnboardingService::class)->nextStep($builder),
            'completed' => (bool) $builder?->isComplete(),
            'about' => [
                'name' => $builder->name ?? $user->name,
                'neighbourhood_id' => $builder?->neighbourhood_id,
                'role' => $builder?->role?->value,
            ],
            'skills' => ($builder?->skills ?? collect())->map(fn (Skill $s) => ['id' => $s->id, 'name' => $s->name])->values(),
            'goals' => [
                'open_to' => $builder->open_to ?? [],
                'building' => $builder?->building_summary,
            ],
            'roles' => BuilderRole::values(),
            'neighbourhoods' => Neighbourhood::orderBy('name')->get(['id', 'name', 'area']),
            'skill_catalogue' => Skill::catalogue()->get(['id', 'name']),
        ];
    }
}
