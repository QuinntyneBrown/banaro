# Observe health

## Overview

Banaro runs as several container instances. The platform that runs them has to know whether each
instance is alive and whether it can serve traffic. The people who operate Banaro have to trace any
request, and any failure, from what a member saw to what the server did. This feature provides health
endpoints and structured request logs for the Banaro API. It belongs to the `operations` subsystem.

Terms used in this design:

- **liveness** — fact that the API process is running and can answer HTTP; a failed liveness probe
  leads the orchestrator to restart the instance
- **readiness** — fact that the instance can reach the database, the cache and the queue; a failed
  readiness probe removes the instance from traffic without restarting it
- **orchestrator** — platform that starts, probes, routes traffic to and stops container instances;
  product `<TO SUPPLY>`
- **request ID** — identifier assigned to one HTTP request, returned in the `X-Request-Id` header and
  written to every log line for that request
- **request log line** — single JSON object written when a request completes, with the request ID,
  route, status, duration and member ID
- **error boundary** — innermost step of the `handle()` pipeline that turns an error into an HTTP response
- **maintainer** — person who operates Banaro's releases and infrastructure

`/health/live` answers from the process alone, so a slow database never causes a restart loop.
`/health/ready` checks the three dependencies and answers 503 when any of them is unreachable. Each
request produces one JSON log line. That line is written after the response is final, outside the
exception handling, so a request that ended in a handled exception logs the status the client
actually received.

## Description

The slice lives in the Banaro API. The orchestrator and the log collector sit outside Banaro.

### Backend — health routes

- **Health routes** — `GET /health/live` and `GET /health/ready` are route handlers in
  `app/health/live/route.ts` and `app/health/ready/route.ts`. They sit outside `/api/v1` and use the
  `global` stack only: no session, no CSRF, no authentication and no rate limit. The maintenance
  middleware exempts them (`L2-043` criterion 3).
- **`health/live` route** — returns 200 with `{ "status": "ok" }`. It touches no database, cache or
  queue (`L2-053` criterion 1).
- **`health/ready` route** — calls `ReadinessService.check()`. It returns 200 with
  `{ "status": "ready" }` when every check passes. It returns 503 with `{ "status": "unavailable" }`
  otherwise. The body never names the failed dependency or the error (`L2-053` criterion 2).
- **`ReadinessService`** (`src/services/operations/`) — runs the checks in sequence, each with a short
  timeout, and stops at the first failure. It logs a failed check, with its name and error, at
  `warn` level; the log carries the detail that the body omits.
- **`HealthCheck`** (`src/contracts/`) — interface with `name: string` and `passes(): Promise<boolean>`.
  The implementations live in `src/services/operations/`:
  - `DatabaseCheck` — runs `SELECT 1` on the `pg` pool.
  - `CacheCheck` — sends `PING` to the Redis cache connection.
  - `QueueCheck` — sends `PING` to the Redis connection that the BullMQ queues use.
  - `MediaScannerCheck` — fails in production while `FakeMediaScanner` is bound (ADR-0004).

### Backend — request ID and request log

- **Global stack order** (`src/http/pipeline.ts`) — `logRequest` is first, then `assignRequestId`,
  then the remaining global middleware such as `securityHeaders` and `maintenance`. The error boundary
  is the innermost step and turns every error into a response before that response passes back out
  through the outer middleware. `logRequest` therefore sees the final response, never the error.
- **`assignRequestId`** (`src/http/middleware/`) — takes the incoming `X-Request-Id` when it matches
  `^[A-Za-z0-9-]{8,64}$`, so the Banaro Web SSR server can pass its ID on. Otherwise it generates a
  UUID with `crypto.randomUUID()`. It runs the rest of the request inside an `AsyncLocalStorage`
  context holding the ID, so the pino logger adds `request_id` to every log line of the request, and
  `dispatch()` copies it into queued job data. It sets the same `X-Request-Id` on the response
  (`L2-053` criterion 3).
- **`logRequest`** (`src/http/middleware/`) — records a monotonic start time with
  `process.hrtime.bigint()`, awaits the rest of the pipeline and writes one line with message
  `request` (`L2-053` criteria 3 and 5). It never throws. The line holds:
  - `request_id`
  - `method`
  - `route` — the route pattern, such as `/api/v1/events/[event]/rsvp`, never the raw path or query
    string
  - `status` — the final response status, including statuses produced by the error boundary
  - `duration_ms`
  - `member_id` — the authenticated user's ID, or `null`
  It never logs an e-mail address, a request body, a response body, cookies or the raw client IP.
- **Logger** (`src/logging.ts`) — pino writes one JSON object per line to `stdout`, at the level from
  `LOG_LEVEL`. The orchestrator collects it.
- **Error boundary** (`src/http/pipeline.ts`) — logs an error that is not an `HttpError` at `error`
  level with its name, message, stack and the request ID. It returns 500 with
  `{ "message": "Server Error", "requestId": "…" }` and nothing else (`L2-053` criterion 4). No stack
  trace reaches a response in any environment.

### Open points

- Orchestrator product, probe intervals, timeouts and failure thresholds: `<TO SUPPLY>`.
- Per-check timeout inside `ReadinessService`: `<TO SUPPLY>`.
- Log collector or aggregation service, log retention period and alert rules: `<TO SUPPLY>`.
- Whether the Banaro Web SSR server writes its own structured log and generates request IDs:
  `<TO SUPPLY>`.
- Whether `/health/live` is reachable from the public internet. The `handle-offline-and-maintenance`
  feature probes it from the browser; its body carries no detail. Exposure decision: `<TO SUPPLY>`.

## Requirements

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-053` | `L1-018` | The system shall expose health endpoints and structured logs. |

The design realizes all five acceptance criteria of `L2-053`. The Description cites each criterion
where a component enforces it.

## Diagrams

### System context

The orchestrator probes Banaro's health endpoints and collects its logs. A maintainer reads the logs
to trace a request by its ID.

![C4 system context for observing health](diagrams/c4-context.png)

### Containers

The orchestrator probes the Banaro API. The readiness check reaches the Banaro database and Redis.
The API writes JSON log lines to `stderr`, which the log collector gathers.

![C4 container view for observing health](diagrams/c4-container.png)

### Components

Inside the Banaro API, `logRequest` wraps every request, then `assignRequestId`. The health
controllers sit outside `/api/v1`. `ReadinessRoutes` runs the three `HealthCheck` implementations
through `ReadinessService`.

![C4 component view for observing health](diagrams/c4-component.png)

### Class structure

`ReadinessService` aggregates `HealthCheck` implementations. `logRequest` and the exception handling
both read the request ID that `assignRequestId` stores in the log context.

![Class diagram for observing health](diagrams/class-structure.png)

### Behaviour — probe liveness and readiness

The liveness probe returns 200 without touching a dependency. The readiness probe checks the database,
the cache and the queue, and returns 503 with no detail when any check fails.

![Sequence diagram for probing health](diagrams/sequence-probe-health.png)

### Behaviour — log a request

`assignRequestId` sets the request ID. When the action throws, the exception handler renders a generic
500 with the request ID. `logRequest` then writes one line with the final status.

![Sequence diagram for logging a request](diagrams/sequence-log-request.png)
