<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cashier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'password',
        'phone',
        'email',
        'status'
    ];

    protected $hidden = [
        // Password is not hidden so admin can see it
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Removed date accessor to prevent conflicts
}
