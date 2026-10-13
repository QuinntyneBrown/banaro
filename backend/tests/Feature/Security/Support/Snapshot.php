<?php

namespace Tests\Feature\Security\Support;

use Closure;
use Illuminate\Support\Facades\DB;

/** Captures rows now and answers later whether they are exactly as they were. */
final class Snapshot
{
    /**
     * @param  array<string, mixed>  $where
     * @return Closure(): bool
     */
    public static function of(string $table, array $where): Closure
    {
        $before = self::rows($table, $where);

        return fn (): bool => self::rows($table, $where) === $before;
    }

    /** @param  array<string, mixed>  $where */
    private static function rows(string $table, array $where): string
    {
        $rows = DB::table($table)->where($where)->get()
            ->map(fn (object $row) => json_encode($row, JSON_THROW_ON_ERROR))
            ->sort()
            ->values()
            ->all();

        return json_encode($rows, JSON_THROW_ON_ERROR);
    }
}
