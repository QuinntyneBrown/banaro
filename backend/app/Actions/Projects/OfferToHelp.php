<?php

namespace App\Actions\Projects;

use App\Enums\HelpOfferStatus;
use App\Models\HelpOffer;
use App\Models\Project;
use App\Models\User;
use App\Notifications\Projects\HelpOfferedNotification;
use App\Services\Notifications\NotifyMember;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;

/**
 * Records a member's offer to help and tells the owner (L2-017 criterion 1). The project row is locked
 * first, so two offers from one member at once cannot both be recorded (criterion 3).
 */
class OfferToHelp
{
    public function __construct(private readonly NotifyMember $notify) {}

    /** @throws HttpResponseException 409 `offer_pending` when the member already has an open offer here */
    public function handle(User $offerer, Project $project, string $role, string $message): HelpOffer
    {
        $offer = DB::transaction(function () use ($offerer, $project, $role, $message) {
            Project::whereKey($project->id)->lockForUpdate()->first();

            $open = HelpOffer::where('project_id', $project->id)
                ->where('offerer_id', $offerer->id)
                ->where('status', HelpOfferStatus::Pending->value)
                ->exists();
            if ($open) {
                throw new HttpResponseException(response()->json([
                    'code' => 'offer_pending',
                    'message' => __('projects.offer.pending'),
                ], 409));
            }

            $offer = new HelpOffer(['role' => $role, 'message' => $message]);
            $offer->project_id = $project->id;
            $offer->offerer_id = $offerer->id;
            $offer->status = HelpOfferStatus::Pending;
            $offer->save();

            return $offer;
        });

        $this->notify->handle($project->owner, new HelpOfferedNotification($project, $offerer));

        return $offer->load('offerer.builder.photo');
    }
}
