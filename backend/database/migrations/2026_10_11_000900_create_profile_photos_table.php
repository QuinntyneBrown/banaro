<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Uploaded profile photos: pending in quarantine until scanned, then ready or rejected (L2-008).
        Schema::create('profile_photos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('builder_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('status', 16)->index();
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();
        });

        // The builder's current, ready photo; null shows the initials tile.
        Schema::table('builders', function (Blueprint $table) {
            $table->foreignUuid('photo_id')->nullable()->constrained('profile_photos')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('builders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('photo_id');
        });
        Schema::dropIfExists('profile_photos');
    }
};
