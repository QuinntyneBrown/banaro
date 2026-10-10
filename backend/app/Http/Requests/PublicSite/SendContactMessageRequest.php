<?php

namespace App\Http\Requests\PublicSite;

use App\Enums\ContactTopic;
use App\Rules\EmailAddress;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendContactMessageRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', ...EmailAddress::rules()],
            'topic' => ['required', Rule::enum(ContactTopic::class)],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
            'website' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => __('contact.errors.nameRequired'),
            'name.max' => __('contact.errors.nameMax'),
            'email.*' => __('contact.errors.email'),
            'topic.*' => __('contact.errors.topic'),
            'message.required' => __('contact.errors.messageRequired'),
            'message.min' => __('contact.errors.messageMin'),
            'message.max' => __('contact.errors.messageMax'),
        ];
    }
}
