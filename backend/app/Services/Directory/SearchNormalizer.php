<?php

namespace App\Services\Directory;

use Illuminate\Support\Str;

/** Lower case without accents, so "José" and "jose" match (L2-009 criterion 4). */
class SearchNormalizer
{
    public function normalize(string $text): string
    {
        return trim((string) preg_replace('/\s+/', ' ', Str::lower(Str::ascii($text))));
    }

    /**
     * A prefix query for Postgres full-text search: each word of the term must start a word of the
     * text. Only letters and digits survive, so the term can never break out of the query syntax.
     */
    public function prefixQuery(string $term): ?string
    {
        $words = preg_split('/[^a-z0-9]+/', $this->normalize($term), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return $words === [] ? null : implode(' & ', array_map(fn (string $w) => "{$w}:*", $words));
    }
}
