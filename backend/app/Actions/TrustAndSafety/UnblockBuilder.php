<?php

namespace App\Actions\TrustAndSafety;

use App\Models\Block;
use App\Models\Builder;
use App\Models\User;

/**
 * Removes the member's own block (L2-032 criterion 3). Visibility returns both ways unless the other
 * member holds a block of their own.
 */
class UnblockBuilder
{
    public function handle(User $member, string $publicId): void
    {
        $blockedUserId = Builder::where('public_id', $publicId)->value('user_id');
        $deleted = $blockedUserId === null ? 0 : Block::where('blocker_id', $member->id)
            ->where('blocked_id', $blockedUserId)
            ->delete();
        if ($deleted === 0) {
            abort(404);
        }
    }
}
