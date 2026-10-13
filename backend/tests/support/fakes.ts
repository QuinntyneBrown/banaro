import { deps } from '../../src/container';
import type { Mail, Mailer } from '../../src/contracts/mailer';
import type { JobDefinition, JobQueue } from '../../src/contracts/queue';

/** Records each message instead of sending it. */
export class InMemoryMailer implements Mailer {
  readonly sent: Mail[] = [];

  async send(mail: Mail): Promise<void> {
    this.sent.push(mail);
  }
}

/** Records each dispatched job instead of queueing it. */
export class FakeQueue implements JobQueue {
  readonly pushed: { job: JobDefinition<unknown>; payload: unknown }[] = [];

  async dispatch<P>(job: JobDefinition<P>, payload: P): Promise<void> {
    this.pushed.push({ job: job as JobDefinition<unknown>, payload });
  }

  payloads<P>(job: JobDefinition<P>): P[] {
    return this.pushed.filter((entry) => entry.job === job).map((entry) => entry.payload as P);
  }
}

/** Runs each dispatched job at once, as Laravel's sync queue did in the PHP tests. */
export class SyncQueue implements JobQueue {
  async dispatch<P>(job: JobDefinition<P>, payload: P): Promise<void> {
    await job.handle(payload, deps());
  }
}
