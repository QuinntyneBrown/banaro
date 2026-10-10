<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/** The account: credentials and e-mail. The public profile is the `Builder`. */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /** @var list<string> */
    protected $fillable = [
        'name',
        'email',
        'password',
        'code_of_conduct_version',
        'code_of_conduct_accepted_at',
    ];

    /** @var list<string> */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'code_of_conduct_accepted_at' => 'datetime',
        ];
    }

    /** @return HasOne<Builder, $this> */
    public function builder(): HasOne
    {
        return $this->hasOne(Builder::class);
    }

    /** E-mail addresses are unique ignoring case and surrounding space (L2-001 criterion 3). */
    public static function canonicalEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }
}
