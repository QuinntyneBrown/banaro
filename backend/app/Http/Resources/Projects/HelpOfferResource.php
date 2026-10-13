<?php

namespace App\Http\Resources\Projects;

use App\Models\HelpOffer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One offer with its offerer linked by profile id. The message is plain; the page encodes it
 * (L2-045 criterion 5).
 *
 * @property-read HelpOffer $resource
 */
class HelpOfferResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $offer = $this->resource;
        $builder = $offer->offerer?->builder;

        return [
            'id' => (string) $offer->id,
            'role' => $offer->role->value,
            'message' => $offer->message,
            'status' => $offer->status->value,
            'created_at' => $offer->created_at?->toIso8601String(),
            'conversation_id' => $offer->conversation_id === null ? null : (string) $offer->conversation_id,
            'offerer' => [
                'id' => $builder?->public_id,
                'name' => $builder?->name ?? $offer->offerer?->name,
                'photo_url' => $builder?->photo?->url(),
            ],
        ];
    }
}
