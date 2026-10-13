<?php

namespace App\Enums;

/** The onboarding steps, in order (L2-006). */
enum OnboardingStep: string
{
    case About = 'about';
    case Skills = 'skills';
    case Goals = 'goals';
}
