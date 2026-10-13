<?php

namespace Tests\Support;

use App\Enums\ProjectStage;
use App\Models\Builder;
use App\Models\Neighbourhood;
use App\Models\Project;
use App\Models\User;
use App\Services\Directory\BuilderSearchText;
use Database\Seeders\ReferenceDataSeeder;

/** Test helpers that build whole members and the records they own, so a test states only what matters. */
trait CreatesMembers
{
    /** A verified member with a finished profile, ready to use every member route. */
    public function member(?string $name = null, string $neighbourhood = 'riverdale'): User
    {
        if (! Neighbourhood::query()->exists()) {
            $this->seed(ReferenceDataSeeder::class);
        }

        $user = User::factory()->create($name === null ? [] : ['name' => $name]);
        $builder = Builder::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'role' => 'engineer',
            'neighbourhood_id' => Neighbourhood::where('slug', $neighbourhood)->value('id'),
            'open_to' => ['co_founding'],
            'onboarding_saved_steps' => ['about', 'skills', 'goals'],
            'onboarding_completed_at' => now(),
            'last_active_at' => now(),
        ]);
        app(BuilderSearchText::class)->refresh($builder->id);

        return $user;
    }

    public function project(User $owner, string $name = 'Psalter'): Project
    {
        $project = new Project([
            'name' => $name,
            'summary' => 'A quiet place to read the psalms together.',
            'description' => null,
            'stage' => ProjectStage::Prototype,
            'link' => null,
        ]);
        $project->owner_id = $owner->id;
        $project->last_activity_at = now();
        $project->save();

        return $project;
    }
}
