<?php

namespace App\Http\Requests\Profiles;

use App\Enums\BuilderRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveOnboardingAboutRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'neighbourhood_id' => ['required', 'integer', Rule::exists('neighbourhoods', 'id')],
            'role' => ['required', Rule::enum(BuilderRole::class)],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => __('identity.errors.nameRequired'),
            'name.max' => __('identity.errors.nameMax'),
            'neighbourhood_id.*' => __('profiles.errors.neighbourhood'),
            'role.*' => __('profiles.errors.role'),
        ];
    }
}
