<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dish_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->comment('Rating from 1 to 5 stars');
            $table->string('user_identifier')->nullable()->comment('IP address or session ID to prevent duplicate ratings');
            $table->text('comment')->nullable()->comment('Optional comment from user');
            $table->timestamps();
            
            // Prevent duplicate ratings from same user
            $table->unique(['dish_id', 'user_identifier']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
