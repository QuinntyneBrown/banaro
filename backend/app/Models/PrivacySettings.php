<?php

namespace App\Models;

use App\Enums\LocationPrecision;
use App\Enums\ProfileAudience;
use Illuminate\Database\Eloquent\Model;

/** A member's privacy choices (L2-036). Accounts without a row read the defaults. */
class PrivacySettings extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $guarded = [];

    /** The defaults of a new account (L2-036 criterion 4, D-046). */
    public const DEFAULTS = [
        'profile_visibility' => ProfileAudience::MembersOnly,
        'location_precision' => LocationPrecision::Neighbourhood,
        'email_contact' => false,
        'show_online_status' => true,
        'list_in_attendees' => false,
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'profile_visibility' => ProfileAudience::class,
            'location_precision' => LocationPrecision::class,
            'email_contact' => 'boolean',
            'show_online_status' => 'boolean',
            'list_in_attendees' => 'boolean',
        ];
    }
}
