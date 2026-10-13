<?php

namespace App\Actions\Projects;

use App\Models\Project;
use App\Models\User;
use App\Services\Projects\ProjectSearchText;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Creates a project owned by the member (L2-012). The member's row is locked first, so two shares at
 * once cannot both slip under the limit of 10 (criterion 4).
 */
class ShareProject
{
    public const LIMIT = 10;

    /** @param  array<string, mixed>  $data */
    public function handle(User $owner, array $data): Project
    {
        return DB::transaction(function () use ($owner, $data) {
            User::whereKey($owner->id)->lockForUpdate()->first();
            if (Project::where('owner_id', $owner->id)->count() >= self::LIMIT) {
                throw new HttpResponseException(response()->json([
                    'code' => 'project_limit',
                    'message' => __('projects.errors.limit', ['limit' => self::LIMIT]),
                ], 422));
            }

            $project = new Project([
                'name' => $data['name'],
                'summary' => $data['summary'],
                'description' => $data['description'] ?? null,
                'stage' => $data['stage'],
                'link' => $data['link'] ?? null,
            ]);
            $project->owner_id = $owner->id;
            $project->last_activity_at = Carbon::now();
            $project->search_text = ProjectSearchText::for($project);
            $project->save();
            $project->setLookingFor($data['looking_for'] ?? []);

            return $project;
        });
    }
}
