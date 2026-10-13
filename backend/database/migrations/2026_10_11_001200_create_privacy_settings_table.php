<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per account; a missing row reads as the defaults (L2-036 criterion 4, D-046).
        Schema::create('privacy_settings', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained()->cascadeOnDelete();
            $table->string('profile_visibility', 16)->default('members');
            $table->string('location_precision', 16)->default('neighbourhood');
            $table->boolean('email_contact')->default(false);
            $table->boolean('show_online_status')->default(true);
            $table->boolean('list_in_attendees')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('privacy_settings');
    }
};
