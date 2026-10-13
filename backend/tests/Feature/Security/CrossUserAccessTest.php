<?php

// Acceptance Test
// Traces to: L2-044
// Description:
// Given member A and member B, when A calls any authenticated route with B's records, then the API
// returns 404 (or 403 where the record is public but not A's to change), exposes nothing of B in the
// response and leaves B's data unchanged. Every authenticated route must have a fixture in
// RouteOwnershipRegistry: a route added without one fails this test, so no route ships without a
// second-member check.

namespace Tests\Feature\Security;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Tests\Feature\Security\Support\Expectation;
use Tests\Feature\Security\Support\RouteOwnershipRegistry;
use Tests\Support\CreatesMembers;
use Tests\TestCase;

class CrossUserAccessTest extends TestCase
{
    use CreatesMembers;
    use RefreshDatabase;

    /** @return list<RoutingRoute> */
    public static function authenticatedRoutes(): array
    {
        return array_values(array_filter(
            Route::getRoutes()->getRoutes(),
            fn (RoutingRoute $route) => in_array('auth:sanctum', $route->gatherMiddleware(), true),
        ));
    }

    public function test_every_authenticated_route_hides_other_members_records(): void
    {
        $fixtures = RouteOwnershipRegistry::all();
        $problems = [];

        foreach (self::authenticatedRoutes() as $route) {
            $name = $route->getName() ?? $route->uri();
            $fixture = $fixtures[$route->getName() ?? ''] ?? null;

            if ($fixture === null) {
                $problems[] = "{$name}: no ownership fixture; add one to RouteOwnershipRegistry";

                continue;
            }

            $owner = $this->member("Owner of {$name}");
            $actor = $this->member("Actor on {$name}");
            $scenario = ($fixture->arrange)($owner, $this);
            $method = collect($route->methods())->first(fn (string $m) => $m !== 'HEAD');

            $response = $this->actingAs($actor)->json($method, route($route->getName(), $scenario->params), $scenario->body);
            $status = $response->getStatusCode();

            $expected = match ($fixture->expect) {
                Expectation::NotFound => $status === 404,
                Expectation::Forbidden => $status === 403,
                Expectation::SelfOnly => $status < 500,
            };
            if (! $expected) {
                $problems[] = "{$name}: answered {$status} to another member, expected {$fixture->expect->name}";
            }

            foreach ($scenario->sentinels as $sentinel) {
                if (str_contains($response->getContent(), $sentinel)) {
                    $problems[] = "{$name}: the response exposes \"{$sentinel}\" from another member's data";
                }
            }

            if ($scenario->intact !== null && ! ($scenario->intact)()) {
                $problems[] = "{$name}: another member's call changed the owner's data";
            }

            $this->app['auth']->forgetGuards();
        }

        $this->assertSame([], $problems, implode("\n", $problems));
    }

    public function test_the_registry_names_only_routes_that_exist(): void
    {
        $names = array_map(fn (RoutingRoute $route) => $route->getName(), self::authenticatedRoutes());

        $this->assertSame([], array_values(array_diff(array_keys(RouteOwnershipRegistry::all()), $names)));
    }
}
