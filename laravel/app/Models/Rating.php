<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'dish_id',
        'rating',
        'user_identifier',
        'comment'
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    /**
     * Get the dish that owns the rating
     */
    public function dish()
    {
        return $this->belongsTo(Dish::class);
    }
}
