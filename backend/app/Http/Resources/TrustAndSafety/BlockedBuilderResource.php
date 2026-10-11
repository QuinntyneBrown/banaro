<?php

namespace App\Http\Resources\TrustAndSafety;

use App\Models\Block;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One row of the member's blocked list (L2-032 criterion 3).
 *
 * @property-read Block $resource
 */
class BlockedBuilderResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $builder = $this->resource->blocked?->builder;

        return [
            'builder_id' => $builder?->public_id,
            'name' => $builder?->name ?? $this->resource->blocked?->name,
            'photo_url' => $builder?->photo?->url(),
            'blocked_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
