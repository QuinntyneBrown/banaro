<?php

namespace Tests\Feature\Security\Support;

/** What another member must get when they call a route with a record that belongs to someone else. */
enum Expectation
{
    /** The record is hidden: 404, so its existence is not revealed (L2-044 criterion 1). */
    case NotFound;

    /** The record may be known but is not theirs to change: 403 (L2-014 criterion 2). */
    case Forbidden;

    /** The route acts on the caller's own data only; nothing of the owner appears or changes. */
    case SelfOnly;
}
