<?php

// Acceptance Test
// Traces to: L2-052
// Description: Visitors receive the en-CA translation catalogue from /api/v1/i18n/en-CA, with ETag
// revalidation; unsupported locales answer 404.

namespace Tests\Feature\UserExperience;

use Tests\TestCase;

class CatalogueTest extends TestCase
{
    public function test_a_visitor_receives_the_en_ca_catalogue_as_a_flat_key_map(): void
    {
        $response = $this->getJson('/api/v1/i18n/en-CA');

        $response->assertOk()
            ->assertHeader('ETag');
        $this->assertSame('Banaro', $response->json()['common.brand'] ?? null);
        $this->assertStringContainsString('public', (string) $response->headers->get('Cache-Control'));
        foreach (array_keys($response->json()) as $key) {
            $this->assertMatchesRegularExpression('/^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/', $key);
        }
    }

    public function test_a_matching_etag_answers_304(): void
    {
        $etag = $this->getJson('/api/v1/i18n/en-CA')->headers->get('ETag');

        $this->getJson('/api/v1/i18n/en-CA', ['If-None-Match' => $etag])
            ->assertStatus(304)
            ->assertContent('');
    }

    public function test_an_unsupported_locale_answers_404(): void
    {
        $this->getJson('/api/v1/i18n/fr-CA')->assertNotFound();
        $this->getJson('/api/v1/i18n/..%2F..%2Fconfig')->assertNotFound();
    }

    public function test_the_api_uses_the_same_catalogue_for_server_side_text(): void
    {
        $this->assertSame('Banaro', __('common.brand'));
    }
}
