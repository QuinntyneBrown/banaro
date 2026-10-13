import { AsyncLocalStorage } from 'node:async_hooks';
import pino, { type DestinationStream, type Logger } from 'pino';

/** The request every log line belongs to; `assignRequestId` sets it (L2-053 criterion 3). */
export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

/** JSON lines to stdout, each tagged with the current request id. */
export function createLogger(destination?: DestinationStream, level?: string): Logger {
  return pino(
    {
      level: level ?? process.env.LOG_LEVEL ?? 'info',
      base: undefined,
      mixin: () => {
        const requestId = requestContext.getStore()?.requestId;
        return requestId ? { request_id: requestId } : {};
      },
    },
    destination,
  );
}
