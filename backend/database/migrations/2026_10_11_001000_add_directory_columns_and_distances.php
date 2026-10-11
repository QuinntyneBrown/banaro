<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Directory sorting and search (L2-009): recent activity, join date and the normalised text
        // that search matches. The listener keeps search_text current; the seeder or the next profile
        // save fills it for builders who existed before.
        Schema::table('builders', function (Blueprint $table) {
            $table->timestamp('last_active_at')->nullable()->index();
            $table->text('search_text')->default('');
            $table->index('created_at');
            $table->index('neighbourhood_id');
        });
        // Prefix full-text search over the accent-free text (ADR-0001).
        DB::statement("CREATE INDEX builders_search_text_fts ON builders USING gin (to_tsvector('simple', search_text))");

        // Kilometres between neighbourhood centroids, precomputed so SQL can join, sort and filter by
        // distance with an index (L2-009, L2-010). ReferenceDataSeeder fills it.
        Schema::create('neighbourhood_distances', function (Blueprint $table) {
            $table->foreignId('from_id')->constrained('neighbourhoods')->cascadeOnDelete();
            $table->foreignId('to_id')->constrained('neighbourhoods')->cascadeOnDelete();
            $table->decimal('km', 6, 2);
            $table->primary(['from_id', 'to_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('neighbourhood_distances');
        DB::statement('DROP INDEX IF EXISTS builders_search_text_fts');
        Schema::table('builders', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['neighbourhood_id']);
            $table->dropColumn(['last_active_at', 'search_text']);
        });
    }
};
