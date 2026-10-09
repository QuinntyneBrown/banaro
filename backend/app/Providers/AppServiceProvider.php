<?php

namespace App\Providers;

use App\Services\UserExperience\CatalogueService;
use App\Services\UserExperience\CatalogueTranslationLoader;
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
        //
    }
}
