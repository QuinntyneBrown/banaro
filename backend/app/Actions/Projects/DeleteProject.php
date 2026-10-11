<?php

namespace App\Actions\Projects;

use App\Models\Project;

/**
 * Removes a project with everything that hangs off it (L2-014 criterion 4): its roles now, and its
 * feedback and help offers through their foreign keys as those features arrive.
 */
class DeleteProject
{
    public function handle(Project $project): void
    {
        $project->delete();
    }
}
