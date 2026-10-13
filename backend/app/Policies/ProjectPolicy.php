<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Services\TrustAndSafety\BlockService;

/** Only the owner changes or removes a project (L2-014 criterion 2). */
class ProjectPolicy
{
    public function update(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    /** A member who is not the owner, and not in a blocked pair with the owner (L2-016 criterion 6). */
    public function giveFeedback(User $user, Project $project): bool
    {
        return $project->owner_id !== $user->id
            && ! app(BlockService::class)->isBlockedEitherWay($user->id, $project->owner_id);
    }
}
