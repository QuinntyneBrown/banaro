<?php

namespace App\Services\Operations;

use App\Contracts\HealthCheck;
use App\Contracts\MediaScanner;
use App\Integrations\FakeMediaScanner;

/** Fails in production while the development scanner is bound, so it never takes traffic (ADR-0004). */
class MediaScannerCheck implements HealthCheck
{
    public function __construct(private readonly MediaScanner $scanner) {}

    public function name(): string
    {
        return 'media-scanner';
    }

    public function passes(): bool
    {
        return ! (app()->isProduction() && $this->scanner instanceof FakeMediaScanner);
    }
}
