<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Products members share (L2-012). The public id appears in URLs; the numeric key never does.
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('public_id', 26)->unique();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('summary', 140);
            $table->text('description')->nullable();
            $table->string('stage', 16)->index();
            $table->string('link', 2048)->nullable();
            $table->unsignedInteger('feedback_count')->default(0);
            $table->timestamp('last_activity_at')->nullable()->index();
            $table->text('search_text')->default('');
            $table->timestamps();
        });
        // Browse searches names and summaries by word prefix, like the directory (ADR-0001).
        DB::statement("CREATE INDEX projects_search_text_fts ON projects USING gin (to_tsvector('simple', search_text))");

        // The roles a project is looking for; browse filters on them (L2-012, L2-015).
        Schema::create('project_looking_for', function (Blueprint $table) {
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('role', 32);
            $table->primary(['project_id', 'role']);
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_looking_for');
        Schema::dropIfExists('projects');
    }
};
