<?php

namespace App\Http\Requests\Directory;

use App\Enums\DirectorySort;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A directory query (L2-009, L2-045): search term, sort, page and page size. Visitors may only use the
 * sorts that need no viewer (D-042).
 */
class SearchDirectoryRequest extends FormRequest
{
    public const PER_PAGE = 12;

    public const MAX_PER_PAGE = 50;

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $sorts = $this->isMember() ? DirectorySort::cases() : DirectorySort::forVisitors();

        return [
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(array_map(fn (DirectorySort $s) => $s->value, $sorts))],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }

    /** A signed-in member with a finished profile gets the member view. */
    public function isMember(): bool
    {
        return (bool) $this->user()?->builder()->whereNotNull('onboarding_completed_at')->exists();
    }

    public function sort(): DirectorySort
    {
        $default = $this->isMember() ? DirectorySort::BestMatch : DirectorySort::RecentlyActive;

        return DirectorySort::tryFrom((string) $this->validated('sort')) ?? $default;
    }
}
