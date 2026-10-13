<?php

namespace App\Http\Requests\Directory;

use App\Enums\BuilderRole;
use App\Enums\DirectorySort;
use App\Enums\OpenTo;
use App\Models\Neighbourhood;
use App\Services\Directory\DirectoryFilters;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A directory query (L2-009, L2-010, L2-045): search term, sort, page and page size, and for members
 * the facet filters. Visitors may use only the sorts that need no viewer, and no filters (D-042,
 * D-044).
 */
class SearchDirectoryRequest extends FormRequest
{
    public const PER_PAGE = 12;

    public const MAX_PER_PAGE = 50;

    private const FILTER_KEYS = ['role', 'open_to', 'area', 'skills', 'distance'];

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $member = $this->isMember();
        $sorts = $member ? DirectorySort::cases() : DirectorySort::forVisitors();
        $rules = [
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(array_map(fn (DirectorySort $s) => $s->value, $sorts))],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
        if (! $member) {
            return $rules + array_fill_keys(self::FILTER_KEYS, ['prohibited']);
        }

        return $rules + [
            'role' => ['nullable', 'array'],
            'role.*' => [Rule::enum(BuilderRole::class)],
            'open_to' => ['nullable', 'array'],
            'open_to.*' => [Rule::enum(OpenTo::class)],
            'area' => ['nullable', 'array'],
            'area.*' => ['string', Rule::in(Neighbourhood::query()->distinct()->pluck('area')->all())],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', Rule::exists('skills', 'slug')],
            'distance' => ['nullable', Rule::in(DirectoryFilters::DISTANCES)],
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

    /** The filters in force; a member without a chosen distance is limited to 40 km (L2-010). */
    public function filters(): DirectoryFilters
    {
        if (! $this->isMember()) {
            return new DirectoryFilters;
        }
        $distance = $this->validated('distance');

        return new DirectoryFilters(
            array_values(array_unique($this->validated('role') ?? [])),
            array_values(array_unique($this->validated('open_to') ?? [])),
            array_values(array_unique($this->validated('area') ?? [])),
            array_values(array_unique($this->validated('skills') ?? [])),
            match ($distance) {
                null => DirectoryFilters::DEFAULT_DISTANCE_KM,
                'any' => null,
                default => (int) $distance,
            },
        );
    }
}
