<?php

// Acceptance Test
// Traces to: L2-052
// Description: i18n:check fails when a key used in frontend or backend code is missing from a
// catalogue, naming the key and where it is used.

namespace Tests\Feature\UserExperience;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class I18nCheckTest extends TestCase
{
    private string $frontend;

    protected function setUp(): void
    {
        parent::setUp();
        $this->frontend = sys_get_temp_dir().'/banaro-i18n-'.uniqid();
        File::ensureDirectoryExists("{$this->frontend}/projects/banaro/src/app/pages/home");
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->frontend);
        parent::tearDown();
    }

    public function test_it_passes_when_every_used_key_is_in_the_catalogue(): void
    {
        $this->writeFrontend('home.html', "<h1>{{ 'common.brand' | t }}</h1>");
        $this->writeFrontend('home.ts', "const brand = this.i18n.t('common.brand');");

        $this->artisan('i18n:check', ['--frontend' => $this->frontend])->assertExitCode(0);
    }

    public function test_it_fails_and_names_a_key_missing_from_the_catalogue(): void
    {
        $this->writeFrontend('home.html', "<h1>{{ 'common.brand' | t }}</h1>\n<p>{{ 'home.notThere' | t: { count: 3 } }}</p>");

        $this->artisan('i18n:check', ['--frontend' => $this->frontend])
            ->expectsOutputToContain('missing home.notThere used in projects/banaro/src/app/pages/home/home.html:2')
            ->assertExitCode(1);
    }

    public function test_it_finds_keys_called_from_typescript(): void
    {
        $this->writeFrontend('home.ts', 'toast.show(this.i18n.t("home.missingToast", { name }));');

        $this->artisan('i18n:check', ['--frontend' => $this->frontend])
            ->expectsOutputToContain('home.missingToast')
            ->assertExitCode(1);
    }

    private function writeFrontend(string $name, string $content): void
    {
        File::put("{$this->frontend}/projects/banaro/src/app/pages/home/{$name}", $content);
    }
}
