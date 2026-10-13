<?php

namespace App\Services\Profiles;

use App\Enums\OnboardingStep;
use App\Models\Builder;
use App\Models\User;

/** Tracks which onboarding steps a member has saved (L2-006 criteria 1, 5 and 6). */
class OnboardingService
{
    /** The member's profile, started on first use with the account's name. */
    public function builderFor(User $user): Builder
    {
        $builder = Builder::firstOrCreate(['user_id' => $user->id], ['name' => $user->name]);
        $user->setRelation('builder', $builder);

        return $builder;
    }

    /** The first step not yet saved, or `finish`. */
    public function nextStep(?Builder $builder): string
    {
        $saved = $builder?->onboarding_saved_steps ?? [];
        foreach (OnboardingStep::cases() as $step) {
            if (! in_array($step->value, $saved, true)) {
                return $step->value;
            }
        }

        return 'finish';
    }

    public function markSaved(Builder $builder, OnboardingStep $step): void
    {
        $saved = $builder->onboarding_saved_steps ?? [];
        if (! in_array($step->value, $saved, true)) {
            $saved[] = $step->value;
            $builder->onboarding_saved_steps = $saved;
        }
    }

    public function isReady(?Builder $builder): bool
    {
        return $builder !== null
            && $this->nextStep($builder) === 'finish'
            && $builder->role !== null
            && $builder->neighbourhood_id !== null;
    }
}
