import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { SessionStore } from './session-store';

/**
 * Member routes: a visitor signs in first and comes back; an unverified member confirms the e-mail
 * address (L2-002 criterion 4); a member who has not finished onboarding goes to /welcome first
 * (L2-006 criterion 1). Runs during server-side rendering too.
 */
export const memberGuard: CanMatchFn = (_route, segments) => {
  const member = inject(SessionStore).member();
  const router = inject(Router);
  if (!member) {
    const path = '/' + segments.map((s) => s.path).join('/');
    return router.createUrlTree(['/sign-in'], { queryParams: { returnTo: path } });
  }
  if (!member.emailVerified) return router.createUrlTree(['/verify-email']);
  if (!member.onboardingComplete) return router.createUrlTree(['/welcome']);
  return true;
};

/** /welcome: signed in and verified, and only until onboarding is finished. */
export const onboardingGuard: CanMatchFn = () => {
  const member = inject(SessionStore).member();
  const router = inject(Router);
  if (!member) return router.createUrlTree(['/sign-in'], { queryParams: { returnTo: '/welcome' } });
  if (!member.emailVerified) return router.createUrlTree(['/verify-email']);
  if (member.onboardingComplete) return router.createUrlTree(['/dashboard']);
  return true;
};

/** Where a member goes after signing in: unfinished business first, then the return path. */
export function landingFor(
  member: { emailVerified: boolean; onboardingComplete: boolean },
  returnTo: string,
): string {
  if (!member.emailVerified) return '/verify-email';
  if (!member.onboardingComplete) return '/welcome';
  return returnTo;
}
