<?php

return [

    // A session ends this many days after sign-in however active it is (L2-005 criterion 5); the
    // idle limit is session.lifetime (30 days).
    'session_absolute_lifetime_days' => (int) env('BANARO_SESSION_ABSOLUTE_LIFETIME_DAYS', 90),

];
