<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Catalogue skills offered at onboarding, and custom skills members add (L2-006, L2-007).
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name', 40);
            $table->string('slug', 60)->unique();
            // Lower case without accents: "Rust" and "rust" are one skill.
            $table->string('normalized_name', 40)->unique();
            $table->boolean('is_catalogue')->default(false);
            $table->unsignedSmallInteger('catalogue_position')->nullable();
            $table->timestamps();
        });

        Schema::create('builder_skill', function (Blueprint $table) {
            $table->foreignId('builder_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('position');
            $table->primary(['builder_id', 'skill_id']);
            $table->index('skill_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('builder_skill');
        Schema::dropIfExists('skills');
    }
};
