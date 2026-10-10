<?php

namespace App\Actions\PublicSite;

use App\Jobs\PublicSite\DeliverContactMessage;
use Illuminate\Support\Facades\Log;

class SendContactMessage
{
    /** Queues the message to the team, or quietly discards it when the honeypot was filled. */
    public function handle(ContactMessageData $message): void
    {
        if ($message->automated) {
            Log::info('Contact message discarded by the honeypot', ['topic' => $message->topic->value]);

            return;
        }

        DeliverContactMessage::dispatch($message);
    }
}
