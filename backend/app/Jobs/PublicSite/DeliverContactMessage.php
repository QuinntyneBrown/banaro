<?php

namespace App\Jobs\PublicSite;

use App\Actions\PublicSite\ContactMessageData;
use App\Mail\ContactMessageMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class DeliverContactMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 5;

    /** @var list<int> */
    public array $backoff = [10, 60, 300, 900];

    public function __construct(public readonly ContactMessageData $message)
    {
        $this->onQueue('mail');
    }

    public function handle(): void
    {
        Mail::to(config('banaro.contact_inbox'))->send(new ContactMessageMail($this->message));
    }
}
