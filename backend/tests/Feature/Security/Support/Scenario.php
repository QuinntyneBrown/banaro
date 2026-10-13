<?php

namespace Tests\Feature\Security\Support;

use Closure;

/** One owner's data prepared for a route, and how to tell afterwards that it was left alone. */
final class Scenario
{
    /**
     * @param  array<string, string>  $params  route parameters that name the owner's record
     * @param  array<string, mixed>  $body  a valid request body, so validation never hides the ownership check
     * @param  list<string>  $sentinels  strings from the owner's data that must never appear in the response
     * @param  Closure(): bool|null  $intact  true while the owner's data is unchanged
     */
    public function __construct(
        public readonly array $params = [],
        public readonly array $body = [],
        public readonly array $sentinels = [],
        public readonly ?Closure $intact = null,
    ) {}
}
