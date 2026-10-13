<?php

namespace Tests\Feature\Security\Fixtures;

use App\Models\User;
use Tests\Feature\Security\Support\Expectation;
use Tests\Feature\Security\Support\RouteOwnershipFixture;
use Tests\Feature\Security\Support\Scenario;
use Tests\Feature\Security\Support\Snapshot;
use Tests\TestCase;

final class ProjectsFixtures
{
    private const BODY = [
        'name' => 'Hijacked',
        'summary' => 'Taking this project over.',
        'stage' => 'idea',
        'looking_for' => [],
    ];

    /** @return list<RouteOwnershipFixture> */
    public static function fixtures(): array
    {
        $ownersProject = function (User $owner, TestCase $t) {
            $project = $t->project($owner);

            return new Scenario(
                params: ['project' => $project->public_id],
                body: self::BODY,
                intact: Snapshot::of('projects', ['owner_id' => $owner->id]),
            );
        };

        return [
            // Sharing creates a project for the caller; the owner's projects are untouched (L2-012).
            new RouteOwnershipFixture('projects.store', Expectation::SelfOnly, function (User $owner, TestCase $t) {
                $t->project($owner);

                return new Scenario(body: self::BODY, intact: Snapshot::of('projects', ['owner_id' => $owner->id]));
            }),
            // Only the owner changes or deletes a project: anyone else gets 403 (L2-014 criterion 2).
            new RouteOwnershipFixture('projects.update', Expectation::Forbidden, $ownersProject),
            new RouteOwnershipFixture('projects.destroy', Expectation::Forbidden, $ownersProject),
        ];
    }
}
