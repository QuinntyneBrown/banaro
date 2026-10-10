<?php

namespace App\Mail;

use App\Actions\PublicSite\ContactMessageData;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** Plain-text contact message to the team inbox, replying to the sender. */
class ContactMessageMail extends Mailable
{
    public function __construct(public readonly ContactMessageData $contact) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->contact->email, $this->contact->name)],
            subject: __('contact.mail.subject', ['topic' => __($this->contact->topic->labelKey())]),
        );
    }

    public function content(): Content
    {
        return new Content(text: 'emails.contact-message');
    }
}
