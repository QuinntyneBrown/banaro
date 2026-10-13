<?php

namespace App\Actions\Projects;

use App\Models\HelpOffer;
use App\Models\Project;
use Illuminate\Pagination\LengthAwarePaginator;

/** A project's offers, open ones first and then newest first (L2-017 criterion 4). */
class ListHelpOffers
{
    /** @return LengthAwarePaginator<int, HelpOffer> */
    public function handle(Project $project, int $page, int $perPage): LengthAwarePaginator
    {
        return HelpOffer::query()
            ->where('project_id', $project->id)
            ->with('offerer.builder.photo')
            ->orderByRaw("(status = 'pending') desc")
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);
    }
}
