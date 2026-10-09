<?php

// Acceptance Test
// Traces to: L2-054
// Description: The API never runs migrations when it boots, and the seed command leaves the same
// database state when it runs twice.

namespace Tests\Feature\Operations;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\RefreshDatabaseState;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DataOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_serving_requests_does_not_run_migrations(): void
    {
        Schema::dropAllTables();

        $this->getJson('/health/live')->assertOk();
        $this->getJson('/health/ready');

        $this->assertFalse(Schema::hasTable('migrations'));

        $this->artisan('migrate')->assertSuccessful();
        RefreshDatabaseState::$migrated = false;
    }

    public function test_seeding_twice_leaves_the_same_state(): void
    {
        $this->artisan('db:seed')->assertSuccessful();
        $first = $this->snapshot();

        $this->artisan('db:seed')->assertSuccessful();

        $this->assertSame($first, $this->snapshot());
    }

    /** @return array<string, int> row count of every table */
    private function snapshot(): array
    {
        $counts = [];
        foreach (Schema::getTableListing() as $table) {
            $counts[$table] = DB::table($table)->count();
        }
        ksort($counts);

        return $counts;
    }
}
