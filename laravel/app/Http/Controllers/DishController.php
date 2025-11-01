<?php
namespace App\Http\Controllers;
use App\Models\Dish;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

/**
 * Dish Controller
 * 
 * Handles CRUD operations for dishes including:
 * - Create, Read, Update, Delete dishes
 * - Single image upload and storage management
 * - Automatic image cleanup when dishes are deleted or updated
 */
class DishController extends Controller
{
    public function index()
    {
        return Dish::orderBy('created_at','desc')
            ->select('id', 'name', 'description', 'price', 'category', 'images', 'is_available', 'average_rating', 'total_ratings')
            ->get();
    }

  public function store(Request $request)
{
    // Log the incoming request data for debugging
    Log::info('Incoming request data:', $request->all());
    
    try {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric|min:0',
            'category'     => 'nullable|string|max:100',
            'images.*'     => 'nullable|image',
            'is_available' => 'boolean'
        ]);

        // Set default description if not provided
        if (!isset($data['description'])) {
            $data['description'] = null;
        }

        // Handle multiple image uploads
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('dishes', 'public');
                $images[] = '/storage/' . $path;
            }
            $data['images'] = $images;
        }

        // التأكد من تحويل is_available إلى boolean
        $data['is_available'] = $request->boolean('is_available');

        $dish = Dish::create($data);

        return response()->json($dish, 201);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Validation failed:', $e->errors());
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('Unexpected error:', ['error' => $e->getMessage()]);
        return response()->json([
            'message' => 'An unexpected error occurred',
            'error' => $e->getMessage()
        ], 500);
    }
}



    public function show(Dish $dish)
    {
        return $dish;
    }

    public function update(Request $request, Dish $dish)
    {
        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'sometimes|required|numeric|min:0',
            'category'    => 'nullable|string|max:100',
            'images.*'    => 'nullable|image|max:2048',
            'is_available'=> 'boolean'
        ]);

        // Set default description if not provided
        if (!isset($data['description'])) {
            $data['description'] = null;
        }

        // Handle multiple image uploads
        if ($request->hasFile('images')) {
            // Delete old images if they exist
            if ($dish->images) {
                foreach ($dish->images as $oldImage) {
                    $this->deleteImageFromStorage($oldImage);
                }
            }
            
            // Upload new images
            $images = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('dishes', 'public');
                $images[] = '/storage/' . $path;
            }
            $data['images'] = $images;
        }

        $dish->update($data);
        
        return response()->json($dish);
    }

    public function destroy(Dish $dish)
    {
        // Delete all images from storage if they exist
        if ($dish->images) {
            foreach ($dish->images as $image) {
                $this->deleteImageFromStorage($image);
            }
        }
        
        $dish->delete();
        return response()->json(null, 204);
    }

    /**
     * Delete image from storage
     */
    public function deleteImage(Request $request)
    {
        $request->validate([
            'image_url' => 'required|string'
        ]);

        $imageUrl = $request->input('image_url');
        
        try {
            $this->deleteImageFromStorage($imageUrl);
            return response()->json(['message' => 'Image deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete image'], 500);
        }
    }

    /**
     * Helper method to delete image from storage
     */
    private function deleteImageFromStorage($imageUrl)
    {
        try {
            // Remove '/storage/' prefix to get the actual path
            $path = str_replace('/storage/', '', $imageUrl);
            
            // Delete from public storage
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                Log::info("Image deleted successfully: {$path}");
            } else {
                Log::warning("Image not found in storage: {$path}");
            }
        } catch (\Exception $e) {
            Log::error("Error deleting image: {$imageUrl}", [
                'error' => $e->getMessage(),
                'path' => $path ?? 'unknown'
            ]);
            throw $e;
        }
    }
}
