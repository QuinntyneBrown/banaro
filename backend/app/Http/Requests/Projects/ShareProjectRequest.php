<?php

namespace App\Http\Requests\Projects;

use App\Enums\LookingForRole;
use App\Enums\ProjectStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A project to share or save (L2-012, L2-014, L2-045). Only these keys pass `validated()`, so an
 * owner in the body is ignored (L2-044 criterion 4).
 */
class ShareProjectRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'summary' => ['required', 'string', 'max:140'],
            'description' => ['nullable', 'string', 'max:2000'],
            'stage' => ['required', Rule::enum(ProjectStage::class)],
            'looking_for' => ['present', 'array'],
            'looking_for.*' => ['distinct', Rule::enum(LookingForRole::class)],
            'link' => ['nullable', 'string', 'max:2048', 'url:http,https'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => __('projects.errors.nameRequired'),
            'name.max' => __('projects.errors.nameMax'),
            'summary.required' => __('projects.errors.summaryRequired'),
            'summary.max' => __('projects.errors.summaryMax'),
            'description.max' => __('projects.errors.descriptionMax'),
            'stage.*' => __('projects.errors.stage'),
            'looking_for.*' => __('projects.errors.lookingFor'),
            'link.*' => __('projects.errors.link'),
        ];
    }
}
