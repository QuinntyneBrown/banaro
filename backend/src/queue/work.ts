import { randomUUID } from 'node:crypto';
import { Worker, type Job, type MinimalJob } from 'bullmq';
import { isInMaintenance } from '../console/commands/maintenance';
import type { Deps } from '../container';
import type { JobDefinition, QueueName } from '../contracts/queue';
import { jobs } from '../jobs';
import { PREFIX, queueConnection } from './bull-queue';

const definitions = new Map<string, JobDefinition<unknown>>(jobs.map((job) => [job.name, job]));

/** Waits the job's backoff before each retry; the last value repeats. */
export function backoffStrategy(
  attemptsMade: number,
  _type?: string,
  _error?: Error,
  job?: MinimalJob,
) {
  const delays = definitions.get(job?.name ?? '')?.backoff ?? [60];
  return delays[Math.min(attemptsMade, delays.length) - 1] * 1000;
}

export async function runJob(job: Job, deps: Deps): Promise<void> {
  const definition = definitions.get(job.name);
  if (!definition) throw new Error(`No job definition named ${job.name}`);
  await definition.handle(job.data, deps);
}

/**
 * Works one queue until it is empty, or for one job with `once`, then stops; the e2e suite drains
 * queues this way. Nothing runs while maintenance mode is on (L2-043 criterion 9). Returns the
 * number of jobs taken.
 */
export async function work(deps: Deps, queue: QueueName, { once = false } = {}): Promise<number> {
  if (await isInMaintenance(deps.redis)) return 0;
  const worker = new Worker(queue, null, {
    connection: queueConnection(),
    prefix: PREFIX,
    settings: { backoffStrategy },
  });
  const token = randomUUID();
  let taken = 0;
  try {
    for (let job = await worker.getNextJob(token, { block: false }); job; ) {
      taken++;
      try {
        await runJob(job, deps);
        await job.moveToCompleted(null, token, false);
      } catch (error) {
        deps.logger.error({ err: error, job: job.name }, 'job failed');
        await job.moveToFailed(error as Error, token, false);
      }
      if (once) break;
      job = await worker.getNextJob(token, { block: false });
    }
  } finally {
    await worker.close();
  }
  return taken;
}
