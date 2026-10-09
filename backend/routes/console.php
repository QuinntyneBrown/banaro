<?php

/*
| Scheduled commands, run by the scheduler service. Every entry uses ->onOneServer() so it runs
| exactly once across worker replicas (L2-054 criterion 5); the cache store is Redis.
*/
