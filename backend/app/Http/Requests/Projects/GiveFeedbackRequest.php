<?php

namespace App\Http\Requests\Projects;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Gate;

/**
 * Feedback of 10 to 1,000 characters (L2-016 criterion 2). The owner and anyone in a blocked pair
 * with the owner are refused with 403 before the text is looked at (criterion 6).
 */
class GiveFeedbackRequest extends FormRequest
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
        return Gate::allows('giveFeedback', $this->project());
    }

    /** The 403 names itself, so the dialog can say why instead of showing a generic failure. */
    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(response()->json([
            'code' => 'feedback_not_allowed',
            'message' => __('projects.feedback.notAllowed'),
        ], 403));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:'.self::MIN, 'max:'.self::MAX],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'body.required' => __('projects.feedback.errors.required'),
            'body.min' => __('projects.feedback.errors.min', ['min' => self::MIN]),
            'body.max' => __('projects.feedback.errors.max', ['max' => '1,000']),
        ];
    }
}
