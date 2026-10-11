<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

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
}
