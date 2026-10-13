import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { IDENTITY_API } from 'api';
import { catchError, of } from 'rxjs';

/**
 * Whether the reset link in the query is still usable, checked while rendering on the server so
 * the page opens in its final state. A link without both parameters, or a failed check, is not.
 */
export const resetPasswordResolver: ResolveFn<boolean> = (route) => {
  const token = route.queryParamMap.get('token');
  const email = route.queryParamMap.get('email');
  if (!token || !email) return of(false);
  return inject(IDENTITY_API)
    .checkPasswordReset({ token, email })
    .pipe(catchError(() => of(false)));
};
