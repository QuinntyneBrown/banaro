<?php

namespace App\Contracts;

interface HealthCheck
{
    public function name(): string;

    public function passes(): bool;
}
