<?php

namespace Tests\Feature\Security\Fixtures;

use App\Models\User;
use Illuminate\Support\Facades\DB;
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

        // Anyone but the owner may give feedback, so another member's call is allowed; what must hold is
        // that the first member's own feedback is left alone (L2-016).
        $feedback = function (User $owner, TestCase $t) {
            $project = $t->project($t->member('Project owner'));
            DB::table('feedback')->insert([
                'project_id' => $project->id, 'author_id' => $owner->id, 'body' => 'Sentinel feedback text',
                'created_at' => now(), 'updated_at' => now(),
            ]);

            return new Scenario(
                params: ['project' => $project->public_id],
                body: ['body' => 'Feedback from another member.'],
                sentinels: [$owner->email],
                intact: Snapshot::of('feedback', ['author_id' => $owner->id]),
            );
        };

        // A project the owner has been offered help on: another member may offer too, but cannot read
        // the owner's offers (L2-017, L2-044).
        $offers = function (User $owner, TestCase $t) {
            $project = $t->project($owner);
            $project->setLookingFor(['contributor']);
            $helper = $t->member('Sentinel Helper');
            DB::table('help_offers')->insert([
                'project_id' => $project->id, 'offerer_id' => $helper->id, 'role' => 'contributor',
                'message' => 'Sentinel offer message', 'status' => 'pending', 'created_at' => now(), 'updated_at' => now(),
            ]);

            return new Scenario(
                params: ['project' => $project->public_id],
                body: ['role' => 'contributor', 'message' => 'An offer from another member.'],
                sentinels: ['Sentinel Helper', 'Sentinel offer message', $owner->email],
                intact: Snapshot::of('help_offers', ['project_id' => $project->id]),
            );
        };

        return [
            new RouteOwnershipFixture('projects.help-offers.index', Expectation::NotFound, $offers),
            new RouteOwnershipFixture('projects.help-offers.store', Expectation::SelfOnly, function (User $owner, TestCase $t) use ($offers) {
                // Here the actor offers on the owner's project; the owner's own offers elsewhere stay put.
                $scenario = $offers($owner, $t);
                $other = $t->project($t->member('Other owner'));
                $other->setLookingFor(['contributor']);
                DB::table('help_offers')->insert([
                    'project_id' => $other->id, 'offerer_id' => $owner->id, 'role' => 'contributor',
                    'message' => 'The owner’s own offer', 'status' => 'pending', 'created_at' => now(), 'updated_at' => now(),
                ]);

                return new Scenario(
                    params: $scenario->params,
                    body: $scenario->body,
                    sentinels: [$owner->email],
                    intact: Snapshot::of('help_offers', ['offerer_id' => $owner->id]),
                );
            }),
            new RouteOwnershipFixture('projects.feedback.store', Expectation::SelfOnly, $feedback),
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
