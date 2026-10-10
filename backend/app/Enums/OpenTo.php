<?php

namespace App\Enums;

/** Kinds of collaboration a builder is open to (L2-006 criterion 3, L2-021). */
enum OpenTo: string
{
    case CoFounding = 'co_founding';
    case Advising = 'advising';
    case Contributing = 'contributing';

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(fn (self $choice) => $choice->value, self::cases());
    }
}
