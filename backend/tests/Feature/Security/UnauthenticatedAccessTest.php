<?php

// Acceptance Test
// Traces to: L2-044
// Description:
// Given a request with no session, when it reaches any route that api_public.php does not declare,
// then the API returns 401 and nothing else about the record is revealed.

namespace Tests\Feature\Security;

use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Str;
use Tests\TestCase;

class UnauthenticatedAccessTest extends TestCase
{
    public function test_every_authenticated_route_answers_401_without_a_session(): void
    {
        $problems = [];

        foreach (CrossUserAccessTest::authenticatedRoutes() as $route) {
            $method = collect($route->methods())->first(fn (string $m) => $m !== 'HEAD');
            $response = $this->json($method, '/'.$this->fill($route));

            if ($response->getStatusCode() !== 401) {
                $problems[] = ($route->getName() ?? $route->uri()).": answered {$response->getStatusCode()} without a session";
            }
        }

        $this->assertSame([], $problems, implode("\n", $problems));
    }

    /** The route's URI with every parameter replaced by a well-formed value for its constraint. */
    private function fill(RoutingRoute $route): string
    {
        return preg_replace_callback('/\{(\w+)\??\}/', fn (array $m) => match (true) {
            ($route->wheres[$m[1]] ?? '') === '[0-9a-z]{26}' => str_repeat('a', 26),
            str_contains($route->wheres[$m[1]] ?? '', '-') => (string) Str::uuid(),
            $m[1] === 'category' => 'matches',
            default => 'x',
        }, $route->uri());
    }
}
