<?php

namespace App\Enums;

/** A profile photo's place in the upload pipeline (L2-008 criterion 4). */
enum PhotoStatus: string
{
    /** Stored in quarantine, waiting for the scan; never served. */
    case Pending = 'pending';
    case Ready = 'ready';
    case Rejected = 'rejected';
}
