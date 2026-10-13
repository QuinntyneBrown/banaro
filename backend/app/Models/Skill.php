<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder as Query;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/** A catalogue skill or one a member added (L2-006 criterion 2). */
class Skill extends Model
{
    protected $guarded = ['id'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['is_catalogue' => 'boolean'];
    }

    /** Lower case without accents, so "Rust", "rust" and "Rüst" compare equal. */
    public static function normalize(string $name): string
    {
        return Str::lower(Str::ascii(trim($name)));
    }

    /** @param Query<Skill> $query */
    public function scopeCatalogue(Query $query): void
    {
        $query->where('is_catalogue', true)->orderBy('catalogue_position');
    }
}
