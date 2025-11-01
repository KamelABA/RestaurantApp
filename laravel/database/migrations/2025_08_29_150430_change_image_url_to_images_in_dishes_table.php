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
            // Drop the old image_url column
            $table->dropColumn('image_url');
            
            // Add new images column as JSON to store multiple image URLs
            $table->json('images')->nullable()->comment('Array of image URLs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dishes', function (Blueprint $table) {
            // Drop the new images column
            $table->dropColumn('images');
            
            // Add back the old image_url column
            $table->string('image_url')->nullable();
        });
    }
};
