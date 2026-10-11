<?php

namespace App\Providers;

use App\Contracts\MediaScanner;
use App\Integrations\FakeMediaScanner;
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

        // ADR-0004: the scanner comes from configuration; only the development adapter exists so far.
        $this->app->bind(MediaScanner::class, fn () => match (config('banaro.media_scanner')) {
            default => new FakeMediaScanner,
        });
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
        // Profile photos: 10 uploads per hour per member (L2-008, L2-046; D-038).
        RateLimiter::for('photo-upload', fn (Request $request) => Limit::perHour(10)->by('user:'.$request->user()?->id));
    }
}
