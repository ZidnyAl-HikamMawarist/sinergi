<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

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
        if (
            $this->app->environment('production')
            || request()->header('x-forwarded-proto') === 'https'
            || request()->isSecure()
            || str_contains(request()->getHost(), 'ngrok')
        ) {
            URL::forceScheme('https');
        }
    }
}
