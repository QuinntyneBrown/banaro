<?php

namespace Tests\Feature\Security\Support;

use App\Models\User;
use Closure;
use Tests\TestCase;

/** The cross-user case for one authenticated route: the owner's record, and what a second member must get. */
final class RouteOwnershipFixture
{
    /** @param  Closure(User, TestCase): Scenario  $arrange  builds the owner's data and names it in a Scenario */
    public function __construct(
        public readonly string $route,
        public readonly Expectation $expect,
        public readonly Closure $arrange,
    ) {}
}
