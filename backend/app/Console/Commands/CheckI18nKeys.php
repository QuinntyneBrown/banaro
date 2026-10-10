<?php

namespace App\Console\Commands;

use App\Services\UserExperience\CatalogueService;
use Illuminate\Console\Command;
use Symfony\Component\Finder\Finder;

/**
 * Fails when a translation key used in code is missing from a catalogue (L2-052 criterion 5).
 */
class CheckI18nKeys extends Command
{
    protected $signature = 'i18n:check {--frontend= : Path to the frontend workspace}';

    protected $description = 'Check that every translation key used in code exists in each catalogue';

    private const KEY = '([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+)';

    public function handle(CatalogueService $catalogues): int
    {
        $frontend = $this->option('frontend') ?: base_path('../frontend');
        $used = array_merge(
            $this->scan("{$frontend}/projects", ['*.ts', '*.html'], [
                '/[\'"]'.self::KEY.'[\'"]\s*\|\s*t\b/',
                '/\bt\(\s*[\'"]'.self::KEY.'[\'"]/',
            ], $frontend),
            $this->scan(base_path(), ['*.php'], [
                '/(?:\b__|\btrans|\btrans_choice|@lang)\(\s*[\'"]'.self::KEY.'[\'"]/',
            ], base_path(), ['app', 'resources/views']),
        );

        $missing = 0;
        foreach (config('banaro.locales') as $locale) {
            $catalogue = $catalogues->catalogue($locale);
            foreach ($used as [$key, $where]) {
                if (! array_key_exists($key, $catalogue)) {
                    $this->error("[{$locale}] missing {$key} used in {$where}");
                    $missing++;
                }
            }
            $unused = array_diff(array_keys($catalogue), array_column($used, 0));
            foreach ($unused as $key) {
                $this->warn("[{$locale}] unused {$key}");
            }
        }

        if ($missing > 0) {
            return self::FAILURE;
        }

        $this->info('Every translation key used in code is in each catalogue.');

        return self::SUCCESS;
    }

    /**
     * @param  list<string>  $names
     * @param  list<string>  $patterns
     * @param  list<string>  $only  subdirectories of $root to search, or all when empty
     * @return list<array{0: string, 1: string}> key and file:line of each use
     */
    private function scan(string $root, array $names, array $patterns, string $relativeTo, array $only = []): array
    {
        if (! is_dir($root)) {
            return [];
        }

        $dirs = $only === [] ? [$root] : array_filter(array_map(fn ($d) => "{$root}/{$d}", $only), 'is_dir');
        if ($dirs === []) {
            return [];
        }

        $finder = (new Finder)->files()->in($dirs)->name($names)->exclude(['node_modules', 'dist', 'vendor', '.angular']);
        $uses = [];
        foreach ($finder as $file) {
            foreach (preg_split('/\R/', $file->getContents()) as $index => $line) {
                foreach ($patterns as $pattern) {
                    if (preg_match_all($pattern, $line, $matches)) {
                        $where = ltrim(str_replace($relativeTo, '', $file->getPathname()), '/\\').':'.($index + 1);
                        foreach ($matches[1] as $key) {
                            $uses[] = [$key, $where];
                        }
                    }
                }
            }
        }

        return $uses;
    }
}
