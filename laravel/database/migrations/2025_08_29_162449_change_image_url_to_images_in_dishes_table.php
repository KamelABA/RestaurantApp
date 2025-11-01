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
        Schema::table('dishes', function (Blueprint $table) {
            // Drop the image_url column
            $table->dropColumn('image_url');
            
            // Add the images column as JSON
            $table->json('images')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dishes', function (Blueprint $table) {
            // Drop the images column
            $table->dropColumn('images');
            
            // Add back the image_url column
            $table->string('image_url')->nullable();
        });
    }
};
