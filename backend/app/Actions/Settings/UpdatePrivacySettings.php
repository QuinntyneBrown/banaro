<?php

namespace App\Actions\Settings;

use App\Models\PrivacySettings;
use App\Models\User;

/** Stores the member's five privacy settings in one statement (L2-036 criterion 1). */
class UpdatePrivacySettings
{
    /** @param  array<string, mixed>  $settings */
    public function handle(User $user, array $settings): PrivacySettings
    {
        return PrivacySettings::updateOrCreate(['user_id' => $user->id], [
            'profile_visibility' => $settings['profile_visibility'],
            'location_precision' => $settings['location_precision'],
            'email_contact' => (bool) $settings['email_contact'],
            'show_online_status' => (bool) $settings['show_online_status'],
            'list_in_attendees' => (bool) $settings['list_in_attendees'],
        ]);
    }
}
