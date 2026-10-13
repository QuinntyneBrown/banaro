// Acceptance Test
// Traces to: L2-040
// Description: A queued contact message is mailed to the team inbox with a reply-to of the sender.

import { describe, expect, it } from 'vitest';
import { deps, setDeps } from '@/src/container';
import { deliverContactMessage } from '@/src/jobs/public-site/deliver-contact-message';
import { InMemoryMailer } from '../../support/fakes';

describe('deliver contact message', () => {
  it('mails the team inbox with reply-to the sender', async () => {
    const mailer = new InMemoryMailer();
    setDeps({ mailer });

    await deliverContactMessage.handle(
      {
        name: 'Amara Osei',
        email: 'amara@harvest.example',
        topic: 'propose-event',
        message: 'Could our Saturday prayer group list a monthly breakfast on Banaro?',
      },
      deps(),
    );

    expect(mailer.sent).toHaveLength(1);
    const [mail] = mailer.sent;
    expect(mail.to).toBe('team@banaro.ca');
    expect(mail.replyTo).toEqual({ name: 'Amara Osei', address: 'amara@harvest.example' });
    expect(mail.subject).toBe('Contact form: Propose an event');
    expect(mail.text).toContain('From: Amara Osei <amara@harvest.example>');
    expect(mail.text).toContain('Topic: Propose an event');
    expect(mail.text).toContain('monthly breakfast');
  });
});
