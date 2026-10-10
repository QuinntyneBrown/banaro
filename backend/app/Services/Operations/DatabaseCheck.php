<?php

namespace App\Services\Operations;

use App\Contracts\HealthCheck;
use Illuminate\Support\Facades\DB;

class DatabaseCheck implements HealthCheck
{
    public function name(): string
    {
        return 'database';
    }

    public function passes(): bool
    {
        DB::select('select 1');

        return true;
    }
}
