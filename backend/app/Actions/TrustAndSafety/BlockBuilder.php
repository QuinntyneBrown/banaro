<?php

namespace App\Actions\TrustAndSafety;

use App\Models\Block;
use App\Models\Builder;
use App\Models\User;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Blocks a builder for the member (L2-032 criterion 1). A missing builder and one who has already
 * blocked the member answer the same 404, so no block is revealed; blocking again changes nothing;
 * nobody is told.
 */
class BlockBuilder
{
    public function __construct(private readonly BlockService $blocks) {}

    public function handle(User $member, string $publicId): Block
    {
        $builder = Builder::where('public_id', $publicId)->whereNotNull('onboarding_completed_at')->first();
        if ($builder === null) {
            abort(404);
        }
        if ($builder->user_id === $member->id) {
            throw new HttpResponseException(response()->json([
                'code' => 'cannot_block_self',
                'message' => __('trustAndSafety.block.errors.self'),
            ], 422));
        }
        if (Block::where('blocker_id', $builder->user_id)->where('blocked_id', $member->id)->exists()) {
            abort(404);
        }

        return Block::firstOrCreate(['blocker_id' => $member->id, 'blocked_id' => $builder->user_id]);
    }
}
