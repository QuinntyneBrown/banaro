<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Requests come from Banaro Web, as a browser's would, so Sanctum treats them as
        // first-party and starts a session.
        $this->withHeader('Origin', config('app.frontend_url'));
    }
}
