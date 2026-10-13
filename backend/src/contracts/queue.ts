import type { Deps } from '../container';

export type QueueName = 'default' | 'mail';

/** Queued work: which queue it runs on, how often it is tried and how long to wait between tries. */
export interface JobDefinition<P> {
  name: string;
  queue: QueueName;
  attempts: number;
  /** Seconds to wait before each retry; the last value repeats. */
  backoff: number[];
  handle(payload: P, deps: Deps): Promise<void>;
}

export interface JobQueue {
  dispatch<P>(job: JobDefinition<P>, payload: P): Promise<void>;
}
