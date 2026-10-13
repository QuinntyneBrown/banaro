<?php

return [

    // A session ends this many days after sign-in however active it is (L2-005 criterion 5); the
    // idle limit is session.lifetime (30 days).
    'session_absolute_lifetime_days' => (int) env('BANARO_SESSION_ABSOLUTE_LIFETIME_DAYS', 90),

    // Keyed hash that identifies a client in rate-limit keys and logs without the raw address
    // (L2-046 criterion 3). Falls back to a key derived from APP_KEY until one is set.
    'client_hash_key' => env('BANARO_CLIENT_HASH_KEY', hash('sha256', 'client|'.env('APP_KEY', ''))),

    // Signs one-click unsubscribe links (L2-029 criterion 3); rotate it to void every link already sent.
    'unsubscribe_key' => env('BANARO_UNSUBSCRIBE_KEY', hash('sha256', 'unsubscribe|'.env('APP_KEY', ''))),

    // Requests per minute for any client (L2-046 criterion 1).
    'api_requests_per_minute' => (int) env('BANARO_API_REQUESTS_PER_MINUTE', 120),

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
