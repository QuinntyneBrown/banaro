<?php

return [

    // Locales served from resources/i18n/{locale}/ (L2-052).
    'locales' => ['en-CA'],

    // Browser cache lifetime of a translation catalogue, in seconds; ETag revalidation follows.
    'catalogue_max_age' => (int) env('BANARO_CATALOGUE_MAX_AGE', 300),

    // Version of the code of conduct members accept (L2-034); raising it prompts acceptance again.
    'code_of_conduct_version' => env('BANARO_CODE_OF_CONDUCT_VERSION', '2026-09-01'),

    // Team inbox that receives contact messages (L2-040).
    'contact_inbox' => env('BANARO_CONTACT_INBOX', 'team@banaro.ca'),

    // Match score (L2-022 criterion 4, D-041): weights of the four factors, the activity window and
    // the distance that scores zero when the member has set none. Skill complement and open-to
    // alignment need matching preferences; without them the other two weights carry the score.
    'matching' => [
        'score_weights' => [
            'skill_complement' => 0.35,
            'open_to' => 0.30,
            'distance' => 0.20,
            'recent_activity' => 0.15,
        ],
        'active_days' => 7,
        'idle_days' => 60,
        'default_max_km' => 40,
    ],

    // Directory presence (D-041): "Online now" within this many minutes of the last request, and
    // activity is written at most this often.
    'presence' => [
        'online_minutes' => 5,
        'record_every_seconds' => 60,
    ],

    // Media scanner adapter (ADR-0004). Only "fake" exists; readiness fails in production with it.
    'media_scanner' => env('BANARO_MEDIA_SCANNER', 'fake'),

];
