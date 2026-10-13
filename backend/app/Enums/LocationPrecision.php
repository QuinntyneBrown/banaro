<?php

namespace App\Enums;

/** How precisely others see where a builder is (L2-036 criterion 3). */
enum LocationPrecision: string
{
    case Neighbourhood = 'neighbourhood';
    /** The city (the neighbourhood's area) and a distance rounded to the nearest 5 km. */
    case CityOnly = 'city';
}
