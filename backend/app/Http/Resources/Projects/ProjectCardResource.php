<?php

namespace App\Http\Resources\Projects;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One project in the listing (L2-015 criterion 1).
 *
 * @property-read Project $resource
 */
class ProjectCardResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $project = $this->resource;
        $owner = $project->owner?->builder;

        return [
            'id' => $project->public_id,
            'name' => $project->name,
            'summary' => $project->summary,
            'stage' => $project->stage->value,
            'looking_for' => $project->lookingFor(),
            'feedback_count' => $project->feedback_count,
            'owner' => ['id' => $owner?->public_id, 'name' => $owner?->name ?? $project->owner?->name],
        ];
    }
}
