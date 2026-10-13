<?php

namespace App\Actions\Projects;

use App\Models\Feedback;
use App\Models\Project;
use App\Models\User;
use App\Notifications\Projects\FeedbackReceivedNotification;
use App\Services\Notifications\NotifyMember;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Stores a member's feedback on a project, counts it, moves the project's last activity and tells
 * the owner (L2-016 criterion 1). The notification leaves after the transaction commits.
 */
class GiveFeedback
{
    public function __construct(private readonly NotifyMember $notify) {}

    public function handle(User $author, Project $project, string $body): Feedback
    {
        $feedback = DB::transaction(function () use ($author, $project, $body) {
            $feedback = new Feedback(['body' => $body]);
            $feedback->project_id = $project->id;
            $feedback->author_id = $author->id;
            $feedback->save();

            Project::whereKey($project->id)->update([
                'feedback_count' => DB::raw('feedback_count + 1'),
                'last_activity_at' => Carbon::now(),
            ]);

            return $feedback;
        });

        $project->refresh();
        $this->notify->handle($project->owner, new FeedbackReceivedNotification($project, $author));

        return $feedback->load('author.builder.photo');
    }
}
