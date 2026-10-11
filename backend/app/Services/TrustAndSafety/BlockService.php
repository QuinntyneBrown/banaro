<?php

namespace App\Services\TrustAndSafety;

use App\Models\Block;
use Illuminate\Database\Eloquent\Builder as Query;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as BaseQuery;

/**
 * The one block rule for every subsystem (L2-032, L2-044 criterion 5): a block in either direction
 * hides two members from each other everywhere the server lists or shows them.
 */
class BlockService
{
    public function isBlockedEitherWay(int $userA, int $userB): bool
    {
        return Block::query()
            ->where(fn ($q) => $q->where('blocker_id', $userA)->where('blocked_id', $userB))
            ->orWhere(fn ($q) => $q->where('blocker_id', $userB)->where('blocked_id', $userA))
            ->exists();
    }

    /**
     * Leaves out rows whose user is blocked by, or has blocked, the viewer.
     *
     * @template TQuery of Query|BaseQuery
     *
     * @param  TQuery  $query
     * @return TQuery
     */
    public function applyScope(Query|BaseQuery $query, int $viewerId, string $userColumn = 'user_id'): Query|BaseQuery
    {
        return $query->whereNotExists(fn (BaseQuery $q) => $q->selectRaw('1')
            ->from('blocks')
            ->where(fn (BaseQuery $w) => $w
                ->where(fn (BaseQuery $a) => $a->where('blocks.blocker_id', $viewerId)->whereColumn('blocks.blocked_id', $userColumn))
                ->orWhere(fn (BaseQuery $b) => $b->where('blocks.blocked_id', $viewerId)->whereColumn('blocks.blocker_id', $userColumn))));
    }

    /** The member's own blocks, newest first, for the blocked list. @return Collection<int, Block> */
    public function blockedByMember(int $blockerId): Collection
    {
        return Block::query()
            ->where('blocker_id', $blockerId)
            ->with('blocked.builder.photo')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }
}
