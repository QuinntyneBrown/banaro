import { Worker } from 'bullmq';
import { isInMaintenance } from './console/commands/maintenance';
import { deps } from './container';
import { backoffStrategy, jobFailed, runJob } from './queue/work';
import { PREFIX, queueConnection } from './queue/bull-queue';

/** The Banaro Worker: runs queued jobs until SIGTERM (ADR-0009). */
const shared = deps();
const workers = (['default', 'mail'] as const).map((queue) =>
  new Worker(queue, (job) => runJob(job, shared), {
    connection: queueConnection(),
    prefix: PREFIX,
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 3),
    settings: { backoffStrategy },
  }).on('failed', (job, error) => {
    if (job) void jobFailed(job, error, shared);
  }),
);

// No job runs while maintenance mode is on; jobs wait in Redis until it ends (L2-043 criterion 9).
const maintenance = setInterval(async () => {
  const paused = await isInMaintenance(shared.redis);
  for (const worker of workers) {
    if (paused && !worker.isPaused()) await worker.pause();
    if (!paused && worker.isPaused()) worker.resume();
  }
}, 2000);

process.once('SIGTERM', async () => {
  clearInterval(maintenance);
  await Promise.all(workers.map((worker) => worker.close()));
  await shared.db.end();
  shared.redis.disconnect();
  shared.cache.disconnect();
  process.exit(0);
});
shared.logger.info('worker started');
