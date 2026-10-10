export interface JoinRequest {
  name: string;
  email: string;
  password: string;
  agreedToCodeOfConduct: boolean;
}

export interface SignInRequest {
  email: string;
  password: string;
}

/** The signed-in account, as `GET /api/v1/session` reports it. */
export interface MemberSession {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  /** Member pages wait for a finished onboarding (L2-006 criterion 1). */
  onboardingComplete: boolean;
  /** The public profile's id, once onboarding has started. */
  builderId: string | null;
}

/** What opening a verification link did (L2-002). */
export type VerificationOutcome =
  /** The e-mail is confirmed. */
  | 'verified'
  /** Expired, used or tampered; `linkKnown` says whether the link was ever issued. */
  | { invalid: true; linkKnown: boolean };

/** Identifies the account for a resend; the session is used when neither is given. */
export interface ResendVerificationRequest {
  token?: string;
  email?: string;
}

/** The two parameters of a reset link. */
export interface PasswordResetLink {
  token: string;
  email: string;
}

export interface ResetPasswordRequest extends PasswordResetLink {
  password: string;
  passwordConfirmation: string;
}
