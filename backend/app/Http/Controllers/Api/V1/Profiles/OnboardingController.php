<?php

namespace App\Http\Controllers\Api\V1\Profiles;

use App\Actions\Profiles\CompleteOnboarding;
use App\Actions\Profiles\SaveOnboardingStep;
use App\Enums\OnboardingStep;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profiles\SaveOnboardingAboutRequest;
use App\Http\Requests\Profiles\SaveOnboardingGoalsRequest;
use App\Http\Requests\Profiles\SaveOnboardingSkillsRequest;
use App\Http\Resources\Profiles\OnboardingResource;
use Illuminate\Http\Request;

/** The signed-in member's own onboarding; no route takes a builder id (L2-044). */
class OnboardingController extends Controller
{
    public function show(Request $request): OnboardingResource
    {
        return new OnboardingResource($request->user());
    }

    public function updateAbout(SaveOnboardingAboutRequest $request, SaveOnboardingStep $save): OnboardingResource
    {
        return $this->saved($request, $save, OnboardingStep::About, $request->validated());
    }

    public function updateSkills(SaveOnboardingSkillsRequest $request, SaveOnboardingStep $save): OnboardingResource
    {
        return $this->saved($request, $save, OnboardingStep::Skills, $request->validated());
    }

    public function updateGoals(SaveOnboardingGoalsRequest $request, SaveOnboardingStep $save): OnboardingResource
    {
        return $this->saved($request, $save, OnboardingStep::Goals, $request->validated());
    }

    public function complete(Request $request, CompleteOnboarding $complete): OnboardingResource
    {
        $complete->handle($request->user());

        return new OnboardingResource($request->user()->fresh());
    }

    /** @param array<string, mixed> $answers */
    private function saved(Request $request, SaveOnboardingStep $save, OnboardingStep $step, array $answers): OnboardingResource
    {
        $save->handle($request->user(), $step, $answers);

        return new OnboardingResource($request->user()->fresh());
    }
}
