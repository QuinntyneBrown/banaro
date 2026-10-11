<?php

namespace App\Services\Matching;

/**
 * How well a builder fits the viewing member: 0–100 and the reasons behind it (L2-022 criterion 4).
 * Reasons are codes with parameters, such as `['code' => 'nearby', 'km' => 1.4]`.
 */
final class MatchScore
{
    /** @param  list<array<string, mixed>>  $reasons */
    public function __construct(
        public readonly int $value,
        public readonly array $reasons,
    ) {}
}
