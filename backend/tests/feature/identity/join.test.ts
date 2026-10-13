// Acceptance Test
// Traces to: L2-001, L2-034
// Description: A visitor joins with name, e-mail, a compliant password and the code of conduct;
// the account starts unverified and a verification e-mail is queued, without revealing whether an
// address is already registered.

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/v1/join/route';
import { deps, setDeps } from '@/src/container';
import type { Mail } from '@/src/contracts/mailer';
import { orm } from '@/src/db/orm';
import { builders } from '@/src/db/schema/builders';
import { users } from '@/src/db/schema/users';
import { sendMail } from '@/src/jobs/send-mail';
import { checkPassword } from '@/src/services/identity/password-policy';
import { Browser } from '../../support/browser';
import { FakeQueue } from '../../support/fakes';

let queue: FakeQueue;

const join = (overrides: Record<string, unknown> = {}, ip = '10.1.0.1') =>
  new Browser(ip).post(POST, '/api/v1/join', {
    json: {
      name: 'Amara Osei',
      email: 'Amara@Harvest.example',
      password: 'harvest-volunteers-2026',
      agreed_to_code_of_conduct: true,
      ...overrides,
    },
  });

const findUser = async (email: string) =>
  (await orm(deps().db).select().from(users).where(eq(users.email, email)))[0];

const mailsTo = (email: string): Mail[] =>
  queue.payloads(sendMail).filter((mail) => mail.to === email);

const errorsOf = async (response: Response) =>
  ((await response.json()) as { errors: Record<string, string[]> }).errors;

describe('join', () => {
  beforeEach(() => {
    queue = new FakeQueue();
    setDeps({ queue });
  });

  it('creates an unverified account and queues a verification e-mail', async () => {
    const response = await join();

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({});
    const user = await findUser('amara@harvest.example');
    expect(user.name).toBe('Amara Osei');
    expect(user.emailVerifiedAt).toBeNull();
    expect(user.codeOfConductVersion).toBe('2026-09-01');
    expect(user.codeOfConductAcceptedAt).not.toBeNull();
    const [mail] = mailsTo('amara@harvest.example');
    expect(mail.subject).toBe('Confirm your e-mail for Banaro');
    expect(mail.text).toMatch(/http:\/\/localhost:4300\/verify-email\?token=[A-Za-z0-9]{64}/);
  });

  it('hashes the password with bcrypt and never returns it', async () => {
    const response = await join();

    const user = await findUser('amara@harvest.example');
    expect(user.password).toMatch(/^\$2[aby]\$\d\d\$/);
    expect(await checkPassword('harvest-volunteers-2026', user.password)).toBe(true);
    expect(await response.text()).not.toContain('harvest-volunteers-2026');
  });

  it('returns 422 per field for invalid input and creates nothing', async () => {
    const response = await join({
      name: '',
      email: 'amara@',
      password: 'short',
      agreed_to_code_of_conduct: false,
    });

    expect(response.status).toBe(422);
    expect(Object.keys(await errorsOf(response)).sort()).toEqual([
      'agreed_to_code_of_conduct',
      'email',
      'name',
      'password',
    ]);
    expect(await orm(deps().db).$count(users)).toBe(0);
  });

  it('caps lengths with specific messages', async () => {
    const response = await join({ name: 'a'.repeat(101), password: 'b'.repeat(129) });

    expect(response.status).toBe(422);
    const errors = await errorsOf(response);
    expect(errors.name).toEqual(['Use 100 characters or fewer']);
    expect(errors.password).toEqual(['Use 128 characters or fewer']);
  });

  it('rejects a common password', async () => {
    const response = await join({ password: 'Unbelievable' });

    expect(response.status).toBe(422);
    expect((await errorsOf(response)).password).toEqual([
      'That password is too common. Choose something harder to guess.',
    ]);
  });

  it('creates no second account for an existing address in any case and sends a notice', async () => {
    await join({ email: 'Amara@Example.com' });
    queue.pushed.length = 0;

    const response = await join({ email: 'amara@example.com', name: 'Someone Else' }, '10.1.0.2');

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({});
    expect(await orm(deps().db).$count(users)).toBe(1);
    const mails = mailsTo('amara@example.com');
    expect(mails.map((mail) => mail.subject)).toEqual(['You already have a Banaro account']);
  });

  it('links the already-registered e-mail to sign-in and reset without a verification link', async () => {
    await join();
    queue.pushed.length = 0;
    await join({}, '10.1.0.3');

    const [mail] = mailsTo('amara@harvest.example');
    expect(mail.text).toContain('/sign-in');
    expect(mail.text).toContain('/forgot-password');
    expect(mail.text.toLowerCase()).not.toContain('verify');
  });

  it('creates no builder profile', async () => {
    await join();

    expect(await orm(deps().db).$count(builders)).toBe(0);
  });

  it('rejects the sixth join from one address within ten minutes', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await join({ email: `person${i}@harvest.example` }, '10.9.9.9')).status).toBe(202);
    }

    const response = await join({ email: 'person6@harvest.example' }, '10.9.9.9');

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
  });
});
