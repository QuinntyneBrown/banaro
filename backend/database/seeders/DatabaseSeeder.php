<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeds the mock cast (docs/mocks/README.md). Every seeder it calls must be idempotent: keyed
 * upserts only, so running `db:seed` twice leaves the same state (L2-054).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([ReferenceDataSeeder::class]);
    }
}
