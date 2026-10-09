<?php

namespace App\Services\UserExperience;

use Illuminate\Contracts\Translation\Loader;

/**
 * Serves Laravel's translator from the same catalogue as the browser. Groups the catalogue does
 * not hold yet (such as the framework's validation messages) fall back to Laravel's `en` files.
 */
class CatalogueTranslationLoader implements Loader
{
    public function __construct(private readonly Loader $fallback, private readonly CatalogueService $catalogue) {}

    public function load($locale, $group, $namespace = null)
    {
        if (($namespace === null || $namespace === '*') && $group !== '*' && $this->catalogue->supports($locale)) {
            $texts = $this->catalogue->group($locale, $group);
            if ($texts !== []) {
                return $texts;
            }
        }

        return $this->fallback->load($this->catalogue->supports($locale) ? 'en' : $locale, $group, $namespace);
    }

    public function addNamespace($namespace, $hint)
    {
        $this->fallback->addNamespace($namespace, $hint);
    }

    public function addJsonPath($path)
    {
        $this->fallback->addJsonPath($path);
    }

    public function namespaces()
    {
        return $this->fallback->namespaces();
    }
}
