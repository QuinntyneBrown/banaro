<?php

namespace App\Actions\Profiles;

use App\Events\ProfileUpdated;
use App\Models\Builder;
use App\Models\User;
use App\Services\Profiles\OnboardingService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Carbon;

class CompleteOnboarding
{
    public function __construct(private readonly OnboardingService $onboarding) {}

    /**
     * Marks the profile complete once every step is saved (L2-006 criterion 5). Finishing again
     * changes nothing.
     *
     * @throws HttpResponseException 422 `onboarding_incomplete` naming the first unfinished step
     */
    public function handle(User $user): Builder
    {
        $builder = $user->builder()->first();

        if (! $this->onboarding->isReady($builder)) {
            throw new HttpResponseException(response()->json([
                'code' => 'onboarding_incomplete',
                'message' => __('profiles.onboarding.errors.incomplete'),
                'next_step' => $this->onboarding->nextStep($builder),
            ], 422));
        }

        if (! $builder->isComplete()) {
            $builder->update(['onboarding_completed_at' => Carbon::now()]);
            // The builder joins the directory, findable by name and skills (L2-009).
            ProfileUpdated::dispatch($builder->id);
        }

        return $builder->load('skills');
    }
}
