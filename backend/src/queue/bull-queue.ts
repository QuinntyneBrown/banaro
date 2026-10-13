import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env';
import type { JobDefinition, JobQueue, QueueName } from '../contracts/queue';

export const PREFIX = 'banaro';

/** BullMQ needs connections that retry forever (ADR-0009). */
export function queueConnection(): Redis {
  return new Redis(env.redisUrl, { db: env.redisDb, maxRetriesPerRequest: null });
}

/** Queues jobs on Redis for the Banaro Worker. */
export class BullQueue implements JobQueue {
  private readonly queues = new Map<QueueName, Queue>();

  async dispatch<P>(job: JobDefinition<P>, payload: P): Promise<void> {
    await this.queue(job.queue).add(job.name, payload, {
      attempts: job.attempts,
      backoff: { type: 'custom' },
      removeOnComplete: true,
    });
  }

  queue(name: QueueName): Queue {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Queue(name, { connection: queueConnection(), prefix: PREFIX });
      this.queues.set(name, queue);
    }
    return queue;
  }
}
