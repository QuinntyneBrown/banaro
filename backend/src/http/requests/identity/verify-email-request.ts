import { z } from 'zod';
import { emailAddress } from '../../validation/rules';

/** A verification link token: 64 letters and digits. */
const linkToken = () => z.string().regex(/^[A-Za-z0-9]{64}$/);

export const VerifyEmailRequest = z.object({ token: linkToken() });

export const ResendVerificationEmailRequest = z.object({
  token: linkToken().nullish(),
  email: emailAddress('identity.errors.email').nullish(),
});
