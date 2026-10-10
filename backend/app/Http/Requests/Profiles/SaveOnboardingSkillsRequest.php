<?php

namespace App\Http\Requests\Profiles;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveOnboardingSkillsRequest extends FormRequest
{
    public const MAX_SKILLS = 12;

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return self::skillRules();
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return self::skillMessages();
    }

    /**
     * Up to 12 entries, each a catalogue skill `{id}` or a skill `{name}` (L2-006 criterion 2,
     * L2-007 criterion 2). Shared with the profile edit.
     *
     * @return array<string, mixed>
     */
    public static function skillRules(): array
    {
        return [
            'skills' => ['present', 'array', 'max:'.self::MAX_SKILLS],
            'skills.*' => ['array'],
            'skills.*.id' => ['nullable', 'integer', Rule::exists('skills', 'id')->where('is_catalogue', true)],
            'skills.*.name' => ['nullable', 'required_without:skills.*.id', 'string', 'max:40'],
        ];
    }

    /** @return array<string, string> */
    public static function skillMessages(): array
    {
        return [
            'skills.max' => __('profiles.errors.skillsMax'),
            'skills.*.name.max' => __('profiles.errors.skillNameMax'),
            'skills.*.*' => __('profiles.errors.skill'),
        ];
    }
}
