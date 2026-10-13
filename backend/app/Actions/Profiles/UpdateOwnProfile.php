<?php

namespace App\Actions\Profiles;

use App\Events\ProfileUpdated;
use App\Models\Builder;
use App\Models\User;
use App\Services\Profiles\SkillCatalogue;
use Illuminate\Support\Facades\DB;

class UpdateOwnProfile
{
    public function __construct(private readonly SkillCatalogue $skills) {}

    /**
     * Replaces the member's own profile in one transaction, so a failure leaves it as it was
     * (L2-007). Text is stored as typed and encoded wherever it is shown (criterion 6).
     *
     * @param  array<string, mixed>  $profile  validated fields only
     */
    public function handle(User $user, array $profile): Builder
    {
        $builder = DB::transaction(function () use ($user, $profile) {
            $builder = $user->builder()->firstOrFail();
            $builder->update([
                'name' => $profile['name'],
                'headline' => $profile['headline'] ?? null,
                'neighbourhood_id' => $profile['neighbourhood_id'],
                'bio' => $profile['bio'] ?? null,
                'open_to' => array_values(array_unique($profile['open_to'])),
                'looking_for' => $profile['looking_for'] ?? null,
                'building_summary' => $profile['building'] ?? null,
            ]);
            $user->update(['name' => $profile['name']]);

            $skills = $profile['skills'];
            ksort($skills);
            $ids = $this->skills->resolve(array_values($skills));
            $builder->skills()->sync(collect($ids)->mapWithKeys(fn (int $id, int $i) => [$id => ['position' => $i + 1]])->all());

            $builder->experience()->delete();
            foreach (array_values($profile['experience']) as $i => $entry) {
                $builder->experience()->create([
                    'position' => $i + 1,
                    'title' => $entry['title'],
                    'organization' => $entry['organization'] ?? null,
                    'started_on' => $entry['started_on'],
                    'ended_on' => $entry['ended_on'] ?? null,
                ]);
            }

            $builder->links()->delete();
            foreach (array_values($profile['links']) as $i => $link) {
                $builder->links()->create(['position' => $i + 1, 'label' => $link['label'], 'url' => $link['url']]);
            }

            return $builder;
        });

        ProfileUpdated::dispatch($builder->id);

        return $builder;
    }
}
