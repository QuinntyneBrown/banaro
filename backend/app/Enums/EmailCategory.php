<?php

namespace App\Enums;

/** The e-mail a member can switch on or off (L2-037). Security e-mail is not a category: it always sends. */
enum EmailCategory: string
{
    case Matches = 'matches';
    case Messages = 'messages';
    case Events = 'events';
    case ProjectActivity = 'project_activity';
    case WeeklyDigest = 'weekly_digest';
}
