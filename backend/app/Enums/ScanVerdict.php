<?php

namespace App\Enums;

enum ScanVerdict: string
{
    case Clean = 'clean';
    case Infected = 'infected';
}
