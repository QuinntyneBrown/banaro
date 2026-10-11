import { artisan } from './backend';

/**
 * Works the default queue until it is empty, as the Banaro Worker would. E2E runs only the API, so a
 * spec that waits on a queued job (a photo scan) runs it here.
 */
export function runQueuedJobs(): void {
  artisan('queue:work', '--queue=default', '--stop-when-empty', '--tries=3');
}
