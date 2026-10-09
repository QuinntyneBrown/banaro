<?php

namespace App\Services\UserExperience;

use Illuminate\Support\Arr;

/**
 * Reads resources/i18n/{locale}/*.json. Each file name is the first key segment, so common.json
 * holds the common.* keys.
 */
class CatalogueService
{
    public function __construct(private readonly string $path) {}

    public function supports(string $locale): bool
    {
        return in_array($locale, config('banaro.locales'), true);
    }

    /** @return array<string, mixed> nested texts of one file, or [] when the file is absent */
    public function group(string $locale, string $group): array
    {
        $file = "{$this->path}/{$locale}/{$group}.json";

        return is_file($file) ? json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR) : [];
    }

    /** @return array<string, string> every key of the locale, flattened to dotted keys */
    public function catalogue(string $locale): array
    {
        $flat = [];
        foreach (glob("{$this->path}/{$locale}/*.json") as $file) {
            $group = basename($file, '.json');
            foreach (Arr::dot($this->group($locale, $group)) as $key => $text) {
                $flat["{$group}.{$key}"] = $text;
            }
        }
        ksort($flat);

        return $flat;
    }
}
