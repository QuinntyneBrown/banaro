<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Distance filters within the response-time budget (L2-010, L2-047); builders.role is
        // already indexed.
        Schema::table('neighbourhood_distances', function (Blueprint $table) {
            $table->index(['from_id', 'km']);
        });
    }

    public function down(): void
    {
        Schema::table('neighbourhood_distances', function (Blueprint $table) {
            $table->dropIndex(['from_id', 'km']);
        });
    }
};
