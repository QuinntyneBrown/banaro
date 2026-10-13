<?php

namespace App\Http\Requests\Profiles;

use App\Enums\OpenTo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveOnboardingGoalsRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'open_to' => ['present', 'array'],
            'open_to.*' => [Rule::enum(OpenTo::class)],
            'building' => ['nullable', 'string', 'max:280'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'open_to.*' => __('profiles.errors.openTo'),
            'building.max' => __('profiles.errors.buildingMax'),
        ];
    }
}
