<?php

return [

    // A session ends this many days after sign-in however active it is (L2-005 criterion 5); the
    // idle limit is session.lifetime (30 days).
    'session_absolute_lifetime_days' => (int) env('BANARO_SESSION_ABSOLUTE_LIFETIME_DAYS', 90),

    // Sent on every response (L2-045 criterion 3). The API returns JSON and files, never pages, so
    // the content policy allows nothing; the web application sets its own policy for its pages.
    'headers' => [
        'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options' => 'nosniff',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
        'Content-Security-Policy' => "default-src 'none'; frame-ancestors 'none'",
    ],

];
