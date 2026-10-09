<?php

namespace App\Services\Operations;

use App\Contracts\HealthCheck;
use Illuminate\Support\Facades\Redis;

class QueueCheck implements HealthCheck
{
    public function name(): string
    {
        return 'queue';
    }

    public function passes(): bool
    {
        Redis::connection(config('queue.connections.redis.connection', 'default'))->ping();

        return true;
    }
}
