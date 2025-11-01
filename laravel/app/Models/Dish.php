<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dish extends Model
{
    protected $fillable = [
        'name','description','price','category','images','is_available',
        'average_rating', 'total_ratings'
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'average_rating' => 'decimal:2',
        'total_ratings' => 'integer',
        'images' => 'array',
    ];

    /**
     * Get the ratings for the dish
     */
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * Calculate and update average rating
     */
    public function updateAverageRating()
    {
        $ratings = $this->ratings();
        $totalRatings = $ratings->count();
        
        if ($totalRatings > 0) {
            $averageRating = $ratings->avg('rating');
            $this->update([
                'average_rating' => round($averageRating, 2),
                'total_ratings' => $totalRatings
            ]);
        } else {
            $this->update([
                'average_rating' => 0.00,
                'total_ratings' => 0
            ]);
        }
    }
}

