<?php

namespace App\Http\Resources\Profiles;

use App\Models\ProfilePhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An uploaded photo's progress; `url` is set once it is ready (L2-008).
 *
 * @property-read ProfilePhoto $resource
 */
class ProfilePhotoResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'status' => $this->resource->status->value,
            'url' => $this->resource->url(),
        ];
    }
}
