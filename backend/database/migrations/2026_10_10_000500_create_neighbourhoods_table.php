<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // GTA neighbourhoods and cities members choose from (L2-006, L2-007). The centroid stands in
        // for every member there, so distances never need an address (L2-009, L2-036).
        Schema::create('neighbourhoods', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 60)->unique();
            $table->string('name', 80);
            // The directory's neighbourhood-or-city filter groups neighbourhoods by area (L2-010).
            $table->string('area', 80)->index();
            $table->decimal('latitude', 9, 6);
            $table->decimal('longitude', 9, 6);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('neighbourhoods');
    }
};
