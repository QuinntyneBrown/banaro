<?php

namespace App\Actions\Projects;

use App\Models\Feedback;
use App\Models\Project;
use App\Models\User;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * A page of a project's feedback, newest first, without feedback from a member the viewer has
 * blocked or who has blocked the viewer (L2-016, L2-032).
 */
class ListProjectFeedback
{
    public function __construct(private readonly BlockService $blocks) {}

    /** @return LengthAwarePaginator<int, Feedback> */
    public function handle(Project $project, ?User $viewer, int $page, int $perPage): LengthAwarePaginator
    {
        $query = Feedback::query()->where('feedback.project_id', $project->id)->with('author.builder.photo');

        if ($viewer !== null) {
            $this->blocks->applyScope($query, $viewer->id, 'feedback.author_id');
        }

        return $query->orderByDesc('feedback.created_at')->orderByDesc('feedback.id')
            ->paginate($perPage, ['feedback.*'], 'page', $page);
    }
}
