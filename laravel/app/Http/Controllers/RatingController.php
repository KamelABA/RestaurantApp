<?php

namespace App\Http\Controllers;

use App\Models\Dish;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    /**
     * Add a rating for a dish
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dish_id' => 'required|exists:dishes,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        // Get user identifier (IP address for now)
        $userIdentifier = $request->ip();

        // Check if user already rated this dish
        $existingRating = Rating::where('dish_id', $request->dish_id)
            ->where('user_identifier', $userIdentifier)
            ->first();

        if ($existingRating) {
            return response()->json([
                'error' => 'You have already rated this dish',
                'message' => 'Each user can only rate a dish once'
            ], 409);
        }

        try {
            // Create the rating
            $rating = Rating::create([
                'dish_id' => $request->dish_id,
                'rating' => $request->rating,
                'user_identifier' => $userIdentifier,
                'comment' => $request->comment
            ]);

            // Update dish average rating
            $dish = Dish::find($request->dish_id);
            $dish->updateAverageRating();

            return response()->json([
                'message' => 'Rating added successfully',
                'rating' => $rating,
                'dish' => $dish->fresh()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add rating',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ratings for a specific dish
     */
    public function getDishRatings($dishId)
    {
        $dish = Dish::findOrFail($dishId);
        
        $ratings = $dish->ratings()
            ->orderBy('created_at', 'desc')
            ->get(['rating', 'comment', 'created_at']);

        return response()->json([
            'dish' => [
                'id' => $dish->id,
                'name' => $dish->name,
                'average_rating' => $dish->average_rating,
                'total_ratings' => $dish->total_ratings
            ],
            'ratings' => $ratings
        ]);
    }

    /**
     * Get all ratings (for admin purposes)
     */
    public function index()
    {
        $ratings = Rating::with('dish:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($ratings);
    }
}
