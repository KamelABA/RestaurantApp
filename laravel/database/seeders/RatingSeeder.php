<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dish;
use App\Models\Rating;

class RatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dishes = Dish::all();

        foreach ($dishes as $dish) {
            // Add 3-8 random ratings for each dish
            $numRatings = rand(3, 8);
            
            for ($i = 0; $i < $numRatings; $i++) {
                Rating::create([
                    'dish_id' => $dish->id,
                    'rating' => rand(1, 5),
                    'user_identifier' => 'seeder_' . $dish->id . '_' . $i,
                    'comment' => $this->getRandomComment()
                ]);
            }
            
            // Update the dish's average rating
            $dish->updateAverageRating();
        }
    }

    private function getRandomComment(): string
    {
        $comments = [
            'Excellent! Highly recommended.',
            'Very tasty and well prepared.',
            'Good quality, would order again.',
            'Nice presentation and flavor.',
            'Delicious! Perfect portion size.',
            'Great taste, fresh ingredients.',
            'Amazing dish, exceeded expectations.',
            'Good value for money.',
            'Tasty and satisfying meal.',
            'Well cooked and flavorful.'
        ];

        return $comments[array_rand($comments)];
    }
}
