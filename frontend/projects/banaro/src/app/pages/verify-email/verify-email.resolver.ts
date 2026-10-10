import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { IDENTITY_API, VerificationOutcome } from 'api';
import { catchError, of } from 'rxjs';

/**
 * Opens the link in `?token=` once, during server-side rendering, so the page never shows a loading
 * state; the browser reuses the server's response through the HTTP transfer cache. Without a token
 * there is nothing to verify. A request that fails outright is treated as a link that did not work.
 */
export const verifyEmailResolver: ResolveFn<VerificationOutcome | null> = (route) => {
  const token = route.queryParamMap.get('token');
  if (!token) return of(null);
  return inject(IDENTITY_API)
    .verifyEmail(token)
    .pipe(catchError(() => of<VerificationOutcome>({ invalid: true, linkKnown: true })));
};
