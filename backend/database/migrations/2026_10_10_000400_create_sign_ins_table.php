<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Devices an account signed in from in the last 90 days (L2-003 criterion 10). A device is a
        // hash of the browser family and the IP network; neither the address nor the user agent is kept.
        Schema::create('sign_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_hash', 64);
            $table->timestamp('created_at');
            $table->index(['user_id', 'device_hash', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sign_ins');
    }
};
