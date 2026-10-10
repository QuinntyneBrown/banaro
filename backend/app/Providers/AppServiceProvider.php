<?php

namespace App\Providers;

use App\Services\UserExperience\CatalogueService;
use App\Services\UserExperience\CatalogueTranslationLoader;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CatalogueService::class, fn () => new CatalogueService(resource_path('i18n')));

        $this->app->extend('translation.loader', fn ($loader, $app) => new CatalogueTranslationLoader(
            $loader,
            $app->make(CatalogueService::class),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Contact form: 3 messages per hour per client, keyed by a hash of the IP (L2-040, L2-046).
        RateLimiter::for('contact', fn (Request $request) => Limit::perHour(3)->by(hash('sha256', (string) $request->ip())));
    }
}
