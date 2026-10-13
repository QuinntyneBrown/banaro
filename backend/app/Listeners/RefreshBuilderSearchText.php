<?php

namespace App\Listeners;

use App\Events\ProfileUpdated;
use App\Services\Directory\BuilderSearchText;

/** Keeps the directory's search text in step with the profile (L2-009 criterion 4). */
class RefreshBuilderSearchText
{
    public function __construct(private readonly BuilderSearchText $searchText) {}

    public function handle(ProfileUpdated $event): void
    {
        $this->searchText->refresh($event->builderId);
    }
}
