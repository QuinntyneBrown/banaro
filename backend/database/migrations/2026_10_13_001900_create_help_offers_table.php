<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Offers to help with a project (L2-017). A member has at most one open offer per project. */
    public function up(): void
    {
        Schema::create('help_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('offerer_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 32);
            $table->text('message');
            $table->string('status', 16)->default('pending');
            $table->timestamp('answered_at')->nullable();
            $table->unsignedBigInteger('conversation_id')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status', 'created_at']);
        });

        // The guard against two open offers from one member, even when two requests race (criterion 3).
        DB::statement("CREATE UNIQUE INDEX help_offers_one_pending_index ON help_offers (project_id, offerer_id) WHERE status = 'pending'");
    }

    public function down(): void
    {
        Schema::dropIfExists('help_offers');
    }
};
