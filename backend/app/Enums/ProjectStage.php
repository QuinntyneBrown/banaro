<?php

namespace App\Enums;

/** How far along a project is, in L2-012's order (D-051). */
enum ProjectStage: string
{
    case Idea = 'idea';
    case Design = 'design';
    case Prototype = 'prototype';
    case Beta = 'beta';
    case Pilot = 'pilot';
    case Launched = 'launched';
}
