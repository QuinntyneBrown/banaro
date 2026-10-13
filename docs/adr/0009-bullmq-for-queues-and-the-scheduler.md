# ADR-0009: BullMQ for Queues and the Scheduler

**Date:** 2026-10-13
**Category:** backend
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

Laravel Horizon ran the Banaro Worker's queues (`default` and `mail`), with retries and backoff per
job, and the Laravel scheduler ran scheduled commands once across replicas. Banaro needs the same
behaviour on Node (ADR-0007):

- e-mail and notifications sent after the transaction commits, retried 5 times at 1 minute,
  5 minutes, 15 minutes, 1 hour and 3 hours (D-059)
- the photo scan retried 3 times, 10 seconds and then 60 seconds apart (D-038)
- scheduled work (Monday matching, event reminders, digests) run exactly once across replicas
  (L2-054)

## Decision

Banaro uses BullMQ on Redis.

- `backend/src/contracts/queue.ts` defines `dispatch(job, payload, { afterCommit })`. Actions call
  only that contract.
- Job definitions live in `backend/src/jobs/{subsystem}/`. Each names its queue, attempts and
  backoff.
- `node dist/worker.js` runs one BullMQ `Worker` per queue and closes them on `SIGTERM`, so a
  rollout drains in-flight jobs.
- `node dist/scheduler.js` registers repeatable jobs. BullMQ stores each schedule once in Redis, so
  each one runs once whatever the replica count.
- Integration tests bind a synchronous queue that runs jobs inline after commit.

## Options Considered

### Option 1: BullMQ (chosen)
- **Pros:** Redis is already in the stack; retries, custom backoff, unique job ids, repeatable jobs
  and pausing are built in.
- **Cons:** no bundled dashboard like Horizon's.

### Option 2: pg-boss
- **Pros:** queues in PostgreSQL, transactional with the data.
- **Cons:** adds queue load to the system of record.

### Option 3: Cron inside the API
- **Pros:** no worker process.
- **Cons:** runs once per replica and dies with the request process.

## Consequences

### Positive
- The worker and scheduler run from the `banaro-api` image, as before.

### Negative
- No queue dashboard. Queue depth and failures are read from logs and `/health/ready`.

### Risks
- A job dispatched inside a transaction that later rolls back would still run. Dispatch inside a
  transaction is therefore always after commit.

## References

- ADR-0007
- `docs/implementation-decisions.md` D-038, D-059
- `docs/specs/L2.md` L2-054
