<?php

namespace App\Contracts;

use App\Enums\ScanVerdict;

/**
 * Port to the media scanner (ADR-0004). An implementation throws when it cannot reach a verdict, so
 * the caller retries; it never answers Clean for a file it did not scan.
 */
interface MediaScanner
{
    public function scan(string $contents): ScanVerdict;
}
