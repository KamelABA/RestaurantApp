<?php

namespace App\Http\Controllers;

use App\Models\Cashier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CashierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cashiers = Cashier::all();
        
        // Return cashiers with password visible for admin
        return response()->json($cashiers->map(function ($cashier) {
            return [
                'id' => $cashier->id,
                'name' => $cashier->name,
                'password' => $cashier->password, // Show password for admin
                'phone' => $cashier->phone,
                'email' => $cashier->email,
                'status' => $cashier->status,
                'createdAt' => $cashier->created_at->format('Y-m-d')
            ];
        }));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $cashier = Cashier::create([
            'name' => $request->name,
            'password' => $request->password, // Store plain text password
            'phone' => $request->phone,
            'email' => $request->email,
            'status' => 'active'
        ]);

        return response()->json([
            'id' => $cashier->id,
            'name' => $cashier->name,
            'password' => $cashier->password,
            'phone' => $cashier->phone,
            'email' => $cashier->email,
            'status' => $cashier->status,
            'createdAt' => $cashier->created_at->format('Y-m-d')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Cashier $cashier)
    {
        return response()->json([
            'id' => $cashier->id,
            'name' => $cashier->name,
            'password' => $cashier->password,
            'phone' => $cashier->phone,
            'email' => $cashier->email,
            'status' => $cashier->status,
            'createdAt' => $cashier->created_at->format('Y-m-d')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cashier $cashier)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:active,inactive',
            'name' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:6',
            'phone' => 'sometimes|nullable|string|max:20',
            'email' => 'sometimes|nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $cashier->update($request->only(['name', 'password', 'phone', 'email', 'status']));

        return response()->json([
            'id' => $cashier->id,
            'name' => $cashier->name,
            'password' => $cashier->password,
            'phone' => $cashier->phone,
            'email' => $cashier->email,
            'status' => $cashier->status,
            'createdAt' => $cashier->created_at->format('Y-m-d')
        ]);
    }

    /**
     * Login cashier
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find cashier by name and password (plain text comparison)
        $cashier = Cashier::where('name', $request->name)
                          ->where('password', $request->password)
                          ->where('status', 'active')
                          ->first();

        if (!$cashier) {
            return response()->json([
                'message' => 'Invalid credentials or cashier is inactive'
            ], 401);
        }

        // Store active session in cache (expires in 8 hours)
        $sessionKey = 'cashier_session_' . $cashier->id;
        $sessionData = [
            'id' => $cashier->id,
            'name' => $cashier->name,
            'login_time' => now()->toISOString(),
            'last_activity' => now()->toISOString()
        ];
        
        Cache::put($sessionKey, $sessionData, now()->addHours(8));

        return response()->json([
            'id' => $cashier->id,
            'name' => $cashier->name,
            'status' => $cashier->status,
            'message' => 'Login successful'
        ]);
    }

    /**
     * Get currently logged in cashiers
     */
    public function getActiveSession()
    {
        try {
            // Check all cashiers for active sessions
            $cashiers = Cashier::all();
            $activeSessions = [];

            foreach ($cashiers as $cashier) {
                $sessionKey = 'cashier_session_' . $cashier->id;
                $sessionData = Cache::get($sessionKey);
                
                if ($sessionData) {
                    // Check if session is still valid (last activity within 30 minutes)
                    $lastActivity = Carbon::parse($sessionData['last_activity']);
                    if ($lastActivity->diffInMinutes(now()) < 30) {
                        $activeSessions[] = $sessionData;
                    } else {
                        // Remove expired session
                        Cache::forget($sessionKey);
                    }
                }
            }

            return response()->json($activeSessions);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Logout cashier
     */
    public function logout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cashier_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $sessionKey = 'cashier_session_' . $request->cashier_id;
        Cache::forget($sessionKey);

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cashier $cashier)
    {
        $cashier->delete();
        
        return response()->json([
            'message' => 'Cashier deleted successfully'
        ]);
    }
}
