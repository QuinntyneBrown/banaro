<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Experience entries and profile links a member lists, in their order (L2-007 criterion 2).
        Schema::create('experience_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('builder_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('position');
            $table->string('title', 100);
            $table->string('organization', 100)->nullable();
            $table->date('started_on');
            $table->date('ended_on')->nullable();
            $table->timestamps();
            $table->index(['builder_id', 'position']);
        });

        Schema::create('profile_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('builder_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('position');
            $table->string('label', 60);
            $table->string('url', 2048);
            $table->timestamps();
            $table->index(['builder_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_links');
        Schema::dropIfExists('experience_entries');
    }
};
