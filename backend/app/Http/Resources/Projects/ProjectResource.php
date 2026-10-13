<?php

namespace App\Http\Resources\Projects;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One project's page (L2-012, L2-013): its fields, its owner linked by their profile id, and whether
 * the viewer owns it.
 *
 * @property-read Project $resource
 */
class ProjectResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $project = $this->resource;
        $owner = $project->owner?->builder;

        return [
            'id' => $project->public_id,
            'name' => $project->name,
            'summary' => $project->summary,
            'description' => $project->description,
            'stage' => $project->stage->value,
            'looking_for' => $project->lookingFor(),
            'link' => $project->link,
            'feedback_count' => $project->feedback_count,
            'owner' => [
                'id' => $owner?->public_id,
                'name' => $owner?->name ?? $project->owner?->name,
                'photo_url' => $owner?->photo?->url(),
            ],
            'is_own' => $request->user()?->id === $project->owner_id,
            'created_at' => $project->created_at?->toIso8601String(),
            'last_activity_at' => $project->last_activity_at?->toIso8601String(),
        ];
    }
}
