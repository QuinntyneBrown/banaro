<?php

return [

    // Locales served from resources/i18n/{locale}/ (L2-052).
    'locales' => ['en-CA'],

    // Browser cache lifetime of a translation catalogue, in seconds; ETag revalidation follows.
    'catalogue_max_age' => (int) env('BANARO_CATALOGUE_MAX_AGE', 300),

    // Team inbox that receives contact messages (L2-040).
    'contact_inbox' => env('BANARO_CONTACT_INBOX', 'team@banaro.ca'),

];
