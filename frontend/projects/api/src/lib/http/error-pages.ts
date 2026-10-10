import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { catchError, throwError } from 'rxjs';

/**
 * Shows an error page in place of the current one. Each application implements it with its
 * router; the api library only decides when.
 */
export interface ErrorPageNavigator {
  /** The API is in maintenance; `expectedBackAt` is an ISO time, or null when unknown. */
  maintenance(expectedBackAt: string | null): void;
}

export const ERROR_PAGE_NAVIGATOR = new InjectionToken<ErrorPageNavigator>('ERROR_PAGE_NAVIGATOR');

/**
 * Any API response that says the API is in maintenance shows the maintenance page, because
 * every later request would fail the same way (L2-043 criterion 2).
 */
export const maintenanceInterceptor: HttpInterceptorFn = (req, next) => {
  const navigator = inject(ERROR_PAGE_NAVIGATOR, { optional: true });
  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        navigator &&
        error instanceof HttpErrorResponse &&
        error.status === 503 &&
        error.error?.code === 'maintenance'
      ) {
        navigator.maintenance(expectedBackAt(error));
      }
      return throwError(() => error);
    }),
  );
};

function expectedBackAt(error: HttpErrorResponse): string | null {
  if (typeof error.error?.expectedBackAt === 'string') return error.error.expectedBackAt;
  const retryAfter = Number(error.headers.get('Retry-After'));
  return Number.isFinite(retryAfter) && retryAfter > 0
    ? new Date(Date.now() + retryAfter * 1000).toISOString()
    : null;
}
