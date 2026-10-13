<?php

namespace App\Http\Requests\Settings;

use App\Enums\LocationPrecision;
use App\Enums\ProfileAudience;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** All five privacy settings, every time (L2-036 criterion 1, L2-045). */
class UpdatePrivacySettingsRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'profile_visibility' => ['required', Rule::enum(ProfileAudience::class)],
            'location_precision' => ['required', Rule::enum(LocationPrecision::class)],
            'email_contact' => ['required', 'boolean'],
            'show_online_status' => ['required', 'boolean'],
            'list_in_attendees' => ['required', 'boolean'],
        ];
    }
}
