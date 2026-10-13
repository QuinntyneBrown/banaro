import { z } from 'zod';
import { emailAddress, message, newPassword } from '../../validation/rules';

/** An address to send a reset link to. */
export const PasswordResetLinkRequest = z.object({
  email: emailAddress('identity.errors.email'),
});

/** A reset link to check. */
export const CheckResetLinkRequest = z.object({
  email: emailAddress('identity.errors.email'),
  token: z.string().max(255),
});

export const ResetPasswordRequest = z
  .object({
    email: emailAddress('identity.errors.email'),
    token: z.string().max(255),
    password: newPassword(),
    password_confirmation: z.string().nullish(),
  })
  .refine((input) => input.password === input.password_confirmation, {
    path: ['password'],
    ...message('identity.reset.errors.mismatch'),
  });
