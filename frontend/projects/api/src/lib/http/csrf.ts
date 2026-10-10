import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { switchMap } from 'rxjs';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Laravel Sanctum protects state-changing requests with the `XSRF-TOKEN` cookie, which Angular
 * echoes as `X-XSRF-TOKEN`. Before the first such request in the browser, fetch the cookie.
 */
export const csrfCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  if (!browser || SAFE_METHODS.includes(req.method) || req.url === '/sanctum/csrf-cookie') {
    return next(req);
  }
  const document = inject(DOCUMENT);
  if (document.cookie.split(';').some((c) => c.trim().startsWith('XSRF-TOKEN='))) {
    return next(req);
  }
  return inject(HttpClient)
    .get('/sanctum/csrf-cookie')
    .pipe(switchMap(() => next(req)));
};
