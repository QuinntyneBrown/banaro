<?php

namespace App\Http\Requests\Projects;

use App\Http\Requests\Concerns\PaginatesResults;
use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

/** A page of a project's offers; only the owner may ask, and anyone else is told it is not there (L2-044). */
class ListHelpOffersRequest extends FormRequest
{
    use PaginatesResults;

    private ?Project $found = null;

    public function project(): Project
    {
        return $this->found ??= Project::where('public_id', $this->route('project'))->firstOr(fn () => abort(404));
    }

    public function authorize(): bool
    {
        Gate::authorize('viewHelpOffers', $this->project());

        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return $this->paginationRules();
    }
}
