<?php

namespace App\Http\Resources\Projects;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One piece of feedback with its author linked by profile id. The text is plain; the page encodes
 * it on output (L2-045 criterion 5).
 *
 * @property-read Feedback $resource
 */
class FeedbackResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $feedback = $this->resource;
        $builder = $feedback->author?->builder;

        return [
            'id' => (string) $feedback->id,
            'body' => $feedback->body,
            'created_at' => $feedback->created_at?->toIso8601String(),
            'author' => [
                'id' => $builder?->public_id,
                'name' => $builder?->name ?? $feedback->author?->name,
                'photo_url' => $builder?->photo?->url(),
            ],
        ];
    }
}
