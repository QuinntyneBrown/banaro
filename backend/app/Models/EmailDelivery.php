<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** The record that one notification's e-mail was queued, sent or failed (L2-029). */
class EmailDelivery extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }
}
