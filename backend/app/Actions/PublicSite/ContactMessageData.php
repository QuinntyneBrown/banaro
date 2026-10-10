<?php

namespace App\Actions\PublicSite;

use App\Enums\ContactTopic;

/** A validated contact message, held as plain text. */
final readonly class ContactMessageData
{
    public function __construct(
        public string $name,
        public string $email,
        public ContactTopic $topic,
        public string $message,
        public bool $automated,
    ) {}

    /** @param array<string, mixed> $validated */
    public static function fromValidated(array $validated): self
    {
        return new self(
            name: $validated['name'],
            email: $validated['email'],
            topic: ContactTopic::from($validated['topic']),
            message: $validated['message'],
            automated: filled($validated['website'] ?? null),
        );
    }
}
