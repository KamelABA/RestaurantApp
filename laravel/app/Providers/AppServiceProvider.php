<?php

namespace App\Providers;


use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
{
    parent::boot();

    // ربط ملف routes/myapi.php كمسارات API جديدة
    Route::middleware('api')
        ->prefix('api')
        ->group(base_path('routes/api.php'));
}
}
