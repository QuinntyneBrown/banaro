<?php

namespace App\Enums;

/** Topics of the contact form (L2-040 criterion 2). */
enum ContactTopic: string
{
    case General = 'general';
    case Partnership = 'partnership';
    case Press = 'press';
    case ReportProblem = 'report-problem';
    case ProposeEvent = 'propose-event';

    /** Catalogue key of the topic's label. */
    public function labelKey(): string
    {
        return 'contact.topics.'.lcfirst($this->name);
    }
}
