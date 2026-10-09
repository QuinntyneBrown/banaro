<?php

namespace App\Services\Operations;

use App\Contracts\HealthCheck;
use Illuminate\Support\Facades\Redis;

class CacheCheck implements HealthCheck
{
    public function name(): string
    {
        return 'cache';
    }

    public function passes(): bool
    {
        Redis::connection('cache')->ping();

        return true;
    }
}
