<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

/** A member saved their profile; the directory refreshes its search text from it. */
class ProfileUpdated
{
    use Dispatchable;

    public function __construct(public readonly int $builderId) {}
}
