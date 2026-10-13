<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A GTA neighbourhood or city; its centroid stands in for every member there (L2-009). */
class Neighbourhood extends Model
{
    protected $guarded = ['id'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['latitude' => 'float', 'longitude' => 'float'];
    }
}
