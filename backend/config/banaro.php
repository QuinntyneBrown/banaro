<?php

return [

    // Locales served from resources/i18n/{locale}/ (L2-052).
    'locales' => ['en-CA'],

    // Browser cache lifetime of a translation catalogue, in seconds; ETag revalidation follows.
    'catalogue_max_age' => (int) env('BANARO_CATALOGUE_MAX_AGE', 300),

    // Version of the code of conduct members accept (L2-034); raising it prompts acceptance again.
    'code_of_conduct_version' => env('BANARO_CODE_OF_CONDUCT_VERSION', '2026-10-01'),

    // Team inbox that receives contact messages (L2-040).
    'contact_inbox' => env('BANARO_CONTACT_INBOX', 'team@banaro.ca'),

];
