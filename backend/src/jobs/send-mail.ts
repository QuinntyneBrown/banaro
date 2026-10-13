import type { Mail } from '../contracts/mailer';
import type { JobDefinition } from '../contracts/queue';

/** Sends an e-mail rendered when it was queued, such as the security e-mail of identity. */
export const sendMail: JobDefinition<Mail> = {
  name: 'SendMail',
  queue: 'mail',
  attempts: 6,
  backoff: [60, 300, 900, 3600, 10800],
  async handle(mail, deps) {
    await deps.mailer.send(mail);
  },
};
