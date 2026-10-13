import { z } from 'zod';
import { accepted, emailAddress, message, newPassword } from '../../validation/rules';

export const JoinBanaroRequest = z.object({
  name: z
    .string(message('identity.errors.nameRequired'))
    .max(100, message('identity.errors.nameMax')),
  email: emailAddress('identity.errors.email'),
  password: newPassword(),
  agreed_to_code_of_conduct: accepted('identity.errors.agree'),
});
