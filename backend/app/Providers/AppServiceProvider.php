<?php

namespace App\Providers;

use App\Models\User;
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
        // Join: 5 attempts per IP in 10 minutes (L2-001 criterion 6).
        RateLimiter::for('join', fn (Request $request) => Limit::perMinutes(10, 5)->by(hash('sha256', (string) $request->ip())));
        // Reset links: 5 per hour per address and 5 per hour per IP; unknown addresses count too (L2-004 criterion 5).
        RateLimiter::for('password-reset', fn (Request $request) => [
            Limit::perHour(5)->by('email:'.hash('sha256', User::canonicalEmail((string) $request->input('email')))),
            Limit::perHour(5)->by('ip:'.hash('sha256', (string) $request->ip())),
        ]);
    }
}
