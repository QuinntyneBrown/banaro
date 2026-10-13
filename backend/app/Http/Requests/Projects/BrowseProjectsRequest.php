<?php

namespace App\Http\Requests\Projects;

use App\Enums\LookingForRole;
use App\Enums\ProjectStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** A project listing query (L2-015, L2-045): search, stages, roles and page. */
class BrowseProjectsRequest extends FormRequest
{
    public const PER_PAGE = 12;

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:100'],
            'stage' => ['nullable', 'array'],
            'stage.*' => [Rule::enum(ProjectStage::class)],
            'looking_for' => ['nullable', 'array'],
            'looking_for.*' => [Rule::enum(LookingForRole::class)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
