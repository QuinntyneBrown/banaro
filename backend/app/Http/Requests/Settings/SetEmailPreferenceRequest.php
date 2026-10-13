<?php

namespace App\Http\Requests\Settings;

use App\Enums\EmailCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** One category and its new value (L2-037 criterion 1, L2-045). */
class SetEmailPreferenceRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['category' => $this->route('category')]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'category' => ['required', Rule::enum(EmailCategory::class)],
            'enabled' => ['required', 'boolean'],
        ];
    }

    public function category(): EmailCategory
    {
        return EmailCategory::from($this->validated('category'));
    }

    public function enabled(): bool
    {
        return $this->boolean('enabled');
    }
}
