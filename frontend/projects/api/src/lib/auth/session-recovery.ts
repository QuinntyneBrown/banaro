import { isPlatformBrowser } from '@angular/common';
import {
  HttpClient,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { catchError, finalize, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { IDENTITY_API } from '../services/identity-api';
import { SessionStore } from './session-store';

export type RecoveryOutcome = 'recovered' | 'signed-out';

/**
 * Asks the member to sign back in when their session has expired. Each application binds it to
 * its own dialog, so this library depends on no application code.
 */
export interface SessionRecovery {
  recover(): Observable<RecoveryOutcome>;
}

export const SESSION_RECOVERY = new InjectionToken<SessionRecovery>('SESSION_RECOVERY');

/** The request waited on a recovery that ended in sign-out; pages ignore it. */
export class SessionEnded extends Error {
  constructor() {
    super('The session ended.');
    this.name = 'SessionEnded';
  }
}

/** Marks the one retry after a recovery, so a second 401 reaches the caller and no loop forms. */
const RETRIED = new HttpContextToken<boolean>(() => false);

/** One recovery at a time: every request that fails meanwhile waits on the same dialog. */
@Injectable({ providedIn: 'root' })
export class SessionRecoveryCoordinator {
  private readonly recovery = inject(SESSION_RECOVERY, { optional: true });
  private pending: Observable<RecoveryOutcome> | null = null;

  recover(): Observable<RecoveryOutcome> {
    if (!this.recovery) return of('signed-out');
    this.pending ??= this.recovery.recover().pipe(
      finalize(() => (this.pending = null)),
      shareReplay(1),
    );
    return this.pending;
  }
}

/**
 * A 401 on an API call while a member is signed in opens the session-expired dialog; the call
 * waits, then runs once more after the member signs back in (L2-005 criteria 1, 2 and 8). A 419
 * means the CSRF token belonged to an old session: with no session left it is handled as a 401,
 * otherwise the token is refreshed and the call retried once. Browser only.
 */
export const sessionExpiryInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    !isPlatformBrowser(inject(PLATFORM_ID)) ||
    !req.url.startsWith('/api/') ||
    req.url.endsWith('/api/v1/session') ||
    req.context.get(RETRIED)
  ) {
    return next(req);
  }
  const session = inject(SessionStore);
  const coordinator = inject(SessionRecoveryCoordinator);
  const identity = inject(IDENTITY_API);
  const http = inject(HttpClient);
  const retry = (request: HttpRequest<unknown>) =>
    next(request.clone({ context: request.context.set(RETRIED, true) }));
  const recoverThenRetry = () =>
    coordinator
      .recover()
      .pipe(
        switchMap((outcome) =>
          outcome === 'recovered' ? retry(req) : throwError(() => new SessionEnded()),
        ),
      );

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || !session.member()) {
        return throwError(() => error);
      }
      if (error.status === 401) return recoverThenRetry();
      if (error.status === 419) {
        return identity
          .getSession()
          .pipe(
            switchMap((member) =>
              member
                ? http.get('/sanctum/csrf-cookie').pipe(switchMap(() => retry(req)))
                : recoverThenRetry(),
            ),
          );
      }
      return throwError(() => error);
    }),
  );
};
