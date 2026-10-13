import type { z } from 'zod';
import type { Deps } from '../../container';
import type { SendContactMessageRequest } from '../../http/requests/public-site/send-contact-message-request';
import { deliverContactMessage } from '../../jobs/public-site/deliver-contact-message';

/** Queues the message to the team, or quietly discards it when the honeypot was filled (L2-040). */
export async function sendContactMessage(
  { website, ...message }: z.output<typeof SendContactMessageRequest>,
  deps: Deps,
): Promise<void> {
  if (website) {
    deps.logger.info({ topic: message.topic }, 'Contact message discarded by the honeypot');
    return;
  }
  await deps.queue.dispatch(deliverContactMessage, message);
}
