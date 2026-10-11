<?php

namespace App\Actions\Projects;

use App\Models\Project;
use App\Services\Projects\ProjectSearchText;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/** Replaces a project's fields and roles, and counts the edit as activity (L2-014 criterion 1). */
class UpdateProject
{
    /** @param  array<string, mixed>  $data */
    public function handle(Project $project, array $data): Project
    {
        return DB::transaction(function () use ($project, $data) {
            $project->fill([
                'name' => $data['name'],
                'summary' => $data['summary'],
                'description' => $data['description'] ?? null,
                'stage' => $data['stage'],
                'link' => $data['link'] ?? null,
            ]);
            $project->last_activity_at = Carbon::now();
            $project->search_text = ProjectSearchText::for($project);
            $project->save();
            $project->setLookingFor($data['looking_for'] ?? []);

            return $project;
        });
    }
}
