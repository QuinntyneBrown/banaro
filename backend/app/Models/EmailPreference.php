<?php

namespace App\Models;

use App\Enums\EmailCategory;
use Illuminate\Database\Eloquent\Model;

class EmailPreference extends Model
{
    protected $fillable = ['user_id', 'category', 'enabled'];

    protected function casts(): array
    {
        return [
            'category' => EmailCategory::class,
            'enabled' => 'boolean',
        ];
    }
}
