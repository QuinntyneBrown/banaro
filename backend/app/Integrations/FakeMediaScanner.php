<?php

namespace App\Integrations;

use App\Contracts\MediaScanner;
use App\Enums\ScanVerdict;

/**
 * Development scanner (ADR-0004): every file is clean except one carrying the EICAR test string.
 * Readiness reports not ready in production while this is bound.
 */
class FakeMediaScanner implements MediaScanner
{
    private const EICAR = 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE';

    public function scan(string $contents): ScanVerdict
    {
        return str_contains($contents, self::EICAR) ? ScanVerdict::Infected : ScanVerdict::Clean;
    }
}
