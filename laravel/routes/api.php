<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DishController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\CashierController;

Route::get('/test', function () {
    return response()->json(['message' => 'API works!']);
});

Route::apiResource('dishes', DishController::class);

// Delete image endpoint
Route::delete('/delete-image', [DishController::class, 'deleteImage']);

// Rating routes
Route::post('/ratings', [RatingController::class, 'store']);
Route::get('/dishes/{dish}/ratings', [RatingController::class, 'getDishRatings']);
Route::get('/ratings', [RatingController::class, 'index']);

// Cashier routes
Route::post('cashiers/login', [CashierController::class, 'login']);
Route::get('cashiers/active-session', [CashierController::class, 'getActiveSession']);
Route::post('cashiers/logout', [CashierController::class, 'logout']);
Route::apiResource('cashiers', CashierController::class);

