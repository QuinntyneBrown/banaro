<?php

namespace App\Http\Resources\Settings;

use App\Models\PrivacySettings;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The member's own privacy settings (L2-036).
 *
 * @property-read PrivacySettings $resource
 */
class PrivacySettingsResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'profile_visibility' => $this->resource->profile_visibility->value,
            'location_precision' => $this->resource->location_precision->value,
            'email_contact' => (bool) $this->resource->email_contact,
            'show_online_status' => (bool) $this->resource->show_online_status,
            'list_in_attendees' => (bool) $this->resource->list_in_attendees,
        ];
    }
}
