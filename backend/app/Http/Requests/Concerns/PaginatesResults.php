<?php

namespace App\Http\Requests\Concerns;

/** Page and page-size input for list endpoints: 12 by default, never more than 50 (L2-047 criterion 4). */
trait PaginatesResults
{
    public const DEFAULT_PER_PAGE = 12;

    public const MAX_PER_PAGE = 50;

    /** @return array<string, mixed> */
    protected function paginationRules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function page(): int
    {
        return (int) ($this->validated('page') ?? 1);
    }

    /** A page size above the cap is lowered to it, not refused. */
    public function perPage(): int
    {
        return min((int) ($this->validated('per_page') ?? self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
    }
}
