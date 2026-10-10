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
                return $this->toLaravelPlaceholders($texts);
            }
        }

        return $this->fallback->load($this->catalogue->supports($locale) ? 'en' : $locale, $group, $namespace);
    }

    /**
     * The catalogue writes placeholders as `{name}` for the browser; Laravel's translator expects
     * `:name`.
     *
     * @param  array<string, mixed>  $texts
     * @return array<string, mixed>
     */
    private function toLaravelPlaceholders(array $texts): array
    {
        array_walk_recursive($texts, function (&$text) {
            $text = is_string($text) ? preg_replace('/\{(\w+)\}/', ':$1', $text) : $text;
        });

        return $texts;
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
