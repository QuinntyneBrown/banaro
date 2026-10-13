<?php

namespace App\Enums;

/** Who a project is looking for (L2-012 criterion 1). */
enum LookingForRole: string
{
    case CoFounder = 'co_founder';
    case TechnicalCoFounder = 'technical_co_founder';
    case Contributor = 'contributor';
    case Advisor = 'advisor';
    case Designer = 'designer';
    case Engineer = 'engineer';
}
