<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Profile fields gathered at onboarding and edited later (L2-006, L2-007). Every column is
        // nullable or defaulted, so the change only adds (expand step, L2-054).
        Schema::table('builders', function (Blueprint $table) {
            // Opaque, non-sequential id used in URLs and API paths instead of the row id.
            $table->ulid('public_id')->nullable()->unique();
            $table->string('name', 100)->nullable();
            $table->string('role', 30)->nullable()->index();
            $table->string('headline', 80)->nullable();
            $table->foreignId('neighbourhood_id')->nullable()->constrained()->nullOnDelete();
            $table->text('bio')->nullable();
            $table->jsonb('open_to')->default('[]');
            $table->string('building_summary', 280)->nullable();
            $table->string('looking_for', 400)->nullable();
            $table->jsonb('onboarding_saved_steps')->default('[]');
            $table->timestamp('onboarding_completed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('builders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('neighbourhood_id');
            $table->dropColumn([
                'public_id', 'name', 'role', 'headline', 'bio', 'open_to', 'building_summary',
                'looking_for', 'onboarding_saved_steps', 'onboarding_completed_at',
            ]);
        });
    }
};
