<?php

namespace App\Services\Operations;

use App\Contracts\HealthCheck;
use Illuminate\Support\Facades\Log;
use Throwable;

class ReadinessService
{
    /** @var list<HealthCheck> */
    private array $checks;

    public function __construct(DatabaseCheck $database, CacheCheck $cache, QueueCheck $queue)
    {
        $this->checks = [$database, $cache, $queue];
    }

    /**
     * Runs each check in turn and stops at the first failure. The failure detail goes to the log,
     * never to the caller.
     */
    public function check(): bool
    {
        foreach ($this->checks as $check) {
            try {
                if (! $check->passes()) {
                    Log::warning('Readiness check failed', ['check' => $check->name()]);

                    return false;
                }
            } catch (Throwable $e) {
                Log::warning('Readiness check failed', ['check' => $check->name(), 'error' => $e->getMessage()]);

                return false;
            }
        }

        return true;
    }
}
