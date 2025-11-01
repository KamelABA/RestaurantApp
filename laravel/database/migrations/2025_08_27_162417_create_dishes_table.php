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
    Schema::create('dishes', function (Blueprint $table) {
        $table->id();
        $table->string('name');                // nom du plat
        $table->text('description')->nullable();
        $table->decimal('price', 8, 2);
        $table->string('category')->nullable();
        $table->string('image_url')->nullable();
        $table->boolean('is_available')->default(true);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dishes');
    }
};
