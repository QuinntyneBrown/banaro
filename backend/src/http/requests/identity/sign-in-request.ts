import { z } from 'zod';
import { emailAddress, message } from '../../validation/rules';

/** No length rule on the password: an over-long one is a failed attempt (L2-003 criterion 9). */
export const SignInRequest = z.object({
  email: emailAddress('identity.signIn.errors.email'),
  password: z.string(message('identity.signIn.errors.password')),
});
