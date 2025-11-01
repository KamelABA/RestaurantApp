<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('welcome');
});

use App\Models\User;


Route::get('/users', function() {
    return User::all();
});

// Serve dish images
Route::get('/storage/dishes/{filename}', function ($filename) {
    $path = storage_path('app/public/dishes/' . $filename);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path);
})->where('filename', '.*');



