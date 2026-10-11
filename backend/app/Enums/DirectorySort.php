<?php

namespace App\Enums;

/** Orders of the builder directory (L2-009 criteria 2 and 3). */
enum DirectorySort: string
{
    case BestMatch = 'best_match';
    case Nearest = 'nearest';
    case RecentlyActive = 'recently_active';
    case Newest = 'newest';

    /** Sorts that need no viewer, so visitors may use them (D-042). */
    public static function forVisitors(): array
    {
        return [self::RecentlyActive, self::Newest];
    }
}
