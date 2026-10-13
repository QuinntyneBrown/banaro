<?php

// Acceptance Test
// Traces to: L2-046
// Description:
// Given any client, when it makes more than 120 API requests in a minute, then the API answers 429
// with Retry-After. The limit is per signed-in member, and per hashed address for anonymous clients.
// Health checks are never limited. When a limit is exceeded, the log records the route and a hashed
// client identifier, never the raw address.

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    private const URL = '/api/v1/i18n/en-CA';

    private function hit(int $times, ?User $as = null, string $ip = '203.0.113.7'): void
    {
        for ($i = 0; $i < $times; $i++) {
            $request = $as ? $this->actingAs($as) : $this;
            $request->withServerVariables(['REMOTE_ADDR' => $ip])->getJson(self::URL)->assertOk();
        }
    }

    public function test_the_121st_request_in_a_minute_answers_429_with_retry_after(): void
    {
        $this->hit(120);

        $response = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])->getJson(self::URL);

        $response->assertStatus(429);
        $this->assertGreaterThan(0, (int) $response->headers->get('Retry-After'));
    }

    public function test_the_limit_is_per_member_not_shared_between_members(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();
        $this->hit(120, $first);

        $this->actingAs($first)->getJson(self::URL)->assertStatus(429);
        $this->actingAs($second)->getJson(self::URL)->assertOk();
    }

    public function test_anonymous_clients_are_limited_per_address(): void
    {
        $this->hit(120, ip: '203.0.113.7');

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])->getJson(self::URL)->assertStatus(429);
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.8'])->getJson(self::URL)->assertOk();
    }

    public function test_a_breach_logs_the_route_and_a_hashed_client_never_the_address(): void
    {
        Log::spy();
        Log::shouldReceive('channel')->andReturn(\Mockery::spy());
        $this->hit(120);

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])->getJson(self::URL)->assertStatus(429);

        Log::shouldHaveReceived('warning')->withArgs(function (string $message, array $context = []) {
            return $message === 'rate_limit.exceeded'
                && ($context['route'] ?? null) === 'api/v1/i18n/{locale}'
                && preg_match('/^[0-9a-f]{64}$/', $context['client'] ?? '') === 1
                && ! str_contains(json_encode($context), '203.0.113.7');
        })->once();
    }

    public function test_health_checks_are_never_limited(): void
    {
        for ($i = 0; $i < 130; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.7'])->getJson('/health/live')->assertOk();
        }
    }
}
