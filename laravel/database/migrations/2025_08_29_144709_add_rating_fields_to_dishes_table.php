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
            $table->decimal('average_rating', 3, 2)->default(0.00)->comment('Average rating from 0.00 to 5.00');
            $table->integer('total_ratings')->default(0)->comment('Total number of ratings received');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dishes', function (Blueprint $table) {
            $table->dropColumn(['average_rating', 'total_ratings']);
        });
    }
};
