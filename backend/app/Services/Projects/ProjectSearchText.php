<?php

namespace App\Services\Projects;

use App\Models\Project;
use App\Services\Directory\SearchNormalizer;

/** The accent-free text browse searches: the project's name and summary (L2-015 criterion 2). */
final class ProjectSearchText
{
    public static function for(Project $project): string
    {
        return app(SearchNormalizer::class)->normalize($project->name.' '.$project->summary);
    }
}
