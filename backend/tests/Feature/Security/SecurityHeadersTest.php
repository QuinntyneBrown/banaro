<?php

// Acceptance Test
// Traces to: L2-045
// Description:
// Given any response from the API, when it is sent, then it carries Strict-Transport-Security,
// X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, a
// Permissions-Policy that restricts unused features, and a Content-Security-Policy that allows no
// script at all. This holds for successful responses, responses the exception handler renders, and
// the health endpoints.

namespace Tests\Feature\Security;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    private function assertHardened($response): void
    {
        $this->assertStringContainsString('max-age=', $response->headers->get('Strict-Transport-Security'));
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $this->assertStringContainsString('camera=()', $response->headers->get('Permissions-Policy'));
        $csp = $response->headers->get('Content-Security-Policy');
        $this->assertStringContainsString("default-src 'none'", $csp);
        $this->assertStringNotContainsString('script-src', $csp);
        $this->assertStringNotContainsString("'unsafe-inline'", $csp);
    }

    public function test_every_json_response_carries_the_security_headers(): void
    {
        $this->assertHardened($this->getJson('/api/v1/i18n/en-CA')->assertOk());
    }

    public function test_responses_rendered_by_the_exception_handler_carry_them_too(): void
    {
        $this->assertHardened($this->getJson('/api/v1/does-not-exist')->assertNotFound());
        $this->assertHardened($this->getJson('/api/v1/me/profile')->assertUnauthorized());
    }

    public function test_the_health_endpoints_carry_them_as_well(): void
    {
        $this->assertHardened($this->getJson('/health/live')->assertOk());
        $this->assertHardened($this->getJson('/health/ready'));
    }
}
