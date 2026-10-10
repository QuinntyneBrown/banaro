<?php

// Acceptance Test
// Traces to: L2-053
// Description: Liveness answers without dependencies; readiness reports 503 with no detail when a
// dependency is unreachable.

namespace Tests\Feature\Operations;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_liveness_returns_ok_without_touching_dependencies(): void
    {
        $this->breakDatabase();
        $this->breakRedis('cache');

        $this->getJson('/health/live')
            ->assertOk()
            ->assertExactJson(['status' => 'ok']);
    }

    public function test_readiness_returns_ready_when_database_cache_and_queue_are_reachable(): void
    {
        $this->getJson('/health/ready')
            ->assertOk()
            ->assertExactJson(['status' => 'ready']);
    }

    public function test_readiness_returns_503_without_detail_when_the_database_is_unreachable(): void
    {
        $this->breakDatabase();

        $this->getJson('/health/ready')
            ->assertStatus(503)
            ->assertExactJson(['status' => 'unavailable']);
    }

    public function test_readiness_returns_503_when_the_cache_is_unreachable(): void
    {
        $this->breakRedis('cache');

        $this->getJson('/health/ready')
            ->assertStatus(503)
            ->assertExactJson(['status' => 'unavailable']);
    }

    public function test_readiness_returns_503_when_the_queue_is_unreachable(): void
    {
        $this->breakRedis('default');

        $this->getJson('/health/ready')
            ->assertStatus(503)
            ->assertExactJson(['status' => 'unavailable']);
    }

    private function breakDatabase(): void
    {
        $default = config('database.default');
        config(["database.connections.{$default}.host" => 'unreachable.invalid']);
        DB::purge($default);
    }

    private function breakRedis(string $connection): void
    {
        config(["database.redis.{$connection}.host" => 'unreachable.invalid']);
        Redis::purge($connection);
    }
}
