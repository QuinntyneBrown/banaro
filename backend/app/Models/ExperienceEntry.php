<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One role on a builder's profile (L2-007 criterion 2). */
class ExperienceEntry extends Model
{
    protected $guarded = ['id'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['started_on' => 'date:Y-m-d', 'ended_on' => 'date:Y-m-d'];
    }
}
