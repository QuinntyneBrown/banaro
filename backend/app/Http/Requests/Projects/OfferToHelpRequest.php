<?php

namespace App\Http\Requests\Projects;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * An offer of one of the project's own "looking for" roles with a message of 10 to 1,000 characters
 * (L2-017 criteria 1 and 2). The owner and a blocked pair are refused with 403 first.
 */
class OfferToHelpRequest extends FormRequest
{
    public const MIN = 10;

    public const MAX = 1000;

    private ?Project $found = null;

    public function project(): Project
    {
        return $this->found ??= Project::where('public_id', $this->route('project'))->firstOr(fn () => abort(404));
    }

    public function authorize(): bool
    {
        return Gate::allows('offerHelp', $this->project());
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(response()->json([
            'code' => 'offer_not_allowed',
            'message' => __('projects.offer.notAllowed'),
        ], 403));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in($this->project()->lookingFor())],
            'message' => ['required', 'string', 'min:'.self::MIN, 'max:'.self::MAX],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'role.required' => __('projects.offer.errors.role'),
            'role.in' => __('projects.offer.errors.role'),
            'message.required' => __('projects.offer.errors.required'),
            'message.min' => __('projects.offer.errors.min', ['min' => self::MIN]),
            'message.max' => __('projects.offer.errors.max', ['max' => '1,000']),
        ];
    }
}
