<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** The five categories as booleans; the resource wraps the array from EmailPreferenceService. */
class EmailPreferencesResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, bool> */
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
