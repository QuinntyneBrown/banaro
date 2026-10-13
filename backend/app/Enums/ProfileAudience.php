<?php

namespace App\Enums;

/** Who can see a profile (L2-036 criterion 1). */
enum ProfileAudience: string
{
    case Everyone = 'everyone';
    case MembersOnly = 'members';
}
