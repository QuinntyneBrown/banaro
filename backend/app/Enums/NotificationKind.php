<?php

namespace App\Enums;

/** The kinds of in-app notification (L2-027); the page turns a kind and its parameters into a sentence. */
enum NotificationKind: string
{
    case MatchesReady = 'matches_ready';
    case NewMessage = 'new_message';
    case RsvpConfirmed = 'rsvp_confirmed';
    case WaitlistPromoted = 'waitlist_promoted';
    case EventReminder = 'event_reminder';
    case FeedbackReceived = 'feedback_received';
    case HelpOffered = 'help_offered';
    case HelpOfferAnswered = 'help_offer_answered';
}
