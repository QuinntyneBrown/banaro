<?php

namespace App\Enums;

/** What best describes a builder's role; the directory filters by it (L2-006, L2-010). */
enum BuilderRole: string
{
    case Founder = 'founder';
    case Engineer = 'engineer';
    case Designer = 'designer';
    case ProductManager = 'product_manager';
    case Other = 'other';

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }
}
