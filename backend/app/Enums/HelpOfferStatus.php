<?php

namespace App\Enums;

/** Where an offer to help stands (L2-017). */
enum HelpOfferStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Declined = 'declined';
}
