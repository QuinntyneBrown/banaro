<?php

namespace App\Services\Settings;

use App\Enums\EmailCategory;
use App\Models\EmailPreference;
use App\Models\User;

/** Reads and stores a member's e-mail categories; a category the member never changed is on (L2-037, D-054). */
class EmailPreferenceService
{
    public function allows(User $user, EmailCategory $category): bool
    {
        return $this->all($user)[$category->value];
    }

    /** @return array<string, bool> */
    public function all(User $user): array
    {
        $stored = EmailPreference::where('user_id', $user->id)->pluck('enabled', 'category');

        $all = [];
        foreach (EmailCategory::cases() as $category) {
            $all[$category->value] = (bool) ($stored[$category->value] ?? true);
        }

        return $all;
    }

    /** Saves one category on its own and returns all five (L2-037 criterion 1). @return array<string, bool> */
    public function set(User $user, EmailCategory $category, bool $enabled): array
    {
        EmailPreference::updateOrCreate(
            ['user_id' => $user->id, 'category' => $category->value],
            ['enabled' => $enabled],
        );

        return $this->all($user);
    }
}
