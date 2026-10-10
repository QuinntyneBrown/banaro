<?php

namespace App\Actions\Profiles;

use App\Enums\OnboardingStep;
use App\Models\Builder;
use App\Models\User;
use App\Services\Profiles\OnboardingService;
use App\Services\Profiles\SkillCatalogue;
use Illuminate\Support\Facades\DB;

class SaveOnboardingStep
{
    public function __construct(
        private readonly OnboardingService $onboarding,
        private readonly SkillCatalogue $skills,
    ) {}

    /**
     * Saves one step whole, or nothing, and records it as saved so it survives leaving (L2-006
     * criteria 2, 3 and 6). Only the validated answers of that step are written.
     *
     * @param  array<string, mixed>  $answers
     */
    public function handle(User $user, OnboardingStep $step, array $answers): Builder
    {
        return DB::transaction(function () use ($user, $step, $answers) {
            $builder = $this->onboarding->builderFor($user);

            match ($step) {
                OnboardingStep::About => $this->saveAbout($user, $builder, $answers),
                OnboardingStep::Skills => $this->saveSkills($builder, $answers['skills'] ?? []),
                OnboardingStep::Goals => $builder->fill([
                    'open_to' => array_values(array_unique($answers['open_to'] ?? [])),
                    'building_summary' => $answers['building'] ?? null,
                ]),
            };

            $this->onboarding->markSaved($builder, $step);
            $builder->save();

            return $builder->load('skills');
        });
    }

    /** @param array<string, mixed> $answers */
    private function saveAbout(User $user, Builder $builder, array $answers): void
    {
        $builder->fill([
            'name' => $answers['name'],
            'neighbourhood_id' => $answers['neighbourhood_id'],
            'role' => $answers['role'],
        ]);
        // One name everywhere: the header and e-mails use the account's.
        $user->update(['name' => $answers['name']]);
    }

    /** @param list<array{id?: int|null, name?: string|null}> $entries */
    private function saveSkills(Builder $builder, array $entries): void
    {
        // Validated nested arrays come back grouped by rule, not in the member's order.
        ksort($entries);
        $ids = $this->skills->resolve(array_values($entries));
        $builder->skills()->sync(collect($ids)->mapWithKeys(fn (int $id, int $i) => [$id => ['position' => $i + 1]])->all());
    }
}
