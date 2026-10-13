<?php

namespace App\Http\Requests\Profiles;

use App\Enums\OpenTo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The whole editable profile (L2-007 criteria 2 and 3). Only these keys reach the action, so
 * anything else in the body is ignored (L2-044 criterion 4). Limits: decision D-032.
 */
class UpdateOwnProfileRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'headline' => ['nullable', 'string', 'max:80'],
            'neighbourhood_id' => ['required', 'integer', Rule::exists('neighbourhoods', 'id')],
            'bio' => ['nullable', 'string', 'max:500'],
            ...SaveOnboardingSkillsRequest::skillRules(),
            'experience' => ['present', 'array', 'max:10'],
            'experience.*.title' => ['required', 'string', 'max:100'],
            'experience.*.organization' => ['nullable', 'string', 'max:100'],
            'experience.*.started_on' => ['required', 'date_format:Y-m-d'],
            'experience.*.ended_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:experience.*.started_on'],
            'links' => ['present', 'array', 'max:5'],
            'links.*.label' => ['required', 'string', 'max:60'],
            'links.*.url' => ['required', 'string', 'max:2048', 'url:http,https'],
            'open_to' => ['required', 'array', 'min:1'],
            'open_to.*' => [Rule::enum(OpenTo::class)],
            'looking_for' => ['nullable', 'string', 'max:400'],
            'building' => ['nullable', 'string', 'max:280'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => __('profiles.errors.nameRequired'),
            'name.max' => __('identity.errors.nameMax'),
            'headline.max' => __('profiles.errors.headlineMax'),
            'neighbourhood_id.*' => __('profiles.errors.neighbourhood'),
            'bio.max' => __('profiles.errors.bioMax', ['count' => mb_strlen((string) $this->input('bio'))]),
            ...SaveOnboardingSkillsRequest::skillMessages(),
            'experience.max' => __('profiles.errors.experienceMax'),
            'experience.*.title.*' => __('profiles.errors.experienceTitle'),
            'experience.*.started_on.*' => __('profiles.errors.experienceStart'),
            'experience.*.ended_on.*' => __('profiles.errors.experienceEnd'),
            'links.max' => __('profiles.errors.linksMax'),
            'links.*.label.*' => __('profiles.errors.linkLabel'),
            'links.*.url.*' => __('profiles.errors.linkUrl'),
            'open_to.required' => __('profiles.errors.openToRequired'),
            'open_to.min' => __('profiles.errors.openToRequired'),
            'open_to.*' => __('profiles.errors.openTo'),
            'looking_for.max' => __('profiles.errors.lookingForMax'),
            'building.max' => __('profiles.errors.buildingMax'),
        ];
    }
}
