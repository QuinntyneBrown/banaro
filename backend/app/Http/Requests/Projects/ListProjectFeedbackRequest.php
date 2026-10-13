<?php

namespace App\Http\Requests\Projects;

use App\Http\Requests\Concerns\PaginatesResults;
use Illuminate\Foundation\Http\FormRequest;

/** A page of a project's feedback: five at a time unless the page asks for more (L2-016, L2-047). */
class ListProjectFeedbackRequest extends FormRequest
{
    use PaginatesResults;

    public const PER_PAGE = 5;

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return $this->paginationRules();
    }

    public function perPage(): int
    {
        return min((int) ($this->validated('per_page') ?? self::PER_PAGE), self::MAX_PER_PAGE);
    }
}
