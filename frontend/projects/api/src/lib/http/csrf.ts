import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { defer, map, of, switchMap } from 'rxjs';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const COOKIE = 'XSRF-TOKEN';
const HEADER = 'X-XSRF-TOKEN';

/**
 * Laravel Sanctum protects state-changing requests with the `XSRF-TOKEN` cookie, echoed back as
 * the `X-XSRF-TOKEN` header. Before the first such request in the browser this fetches the
 * cookie, then sets the header on every same-origin state-changing request.
 */
export const csrfCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  if (!browser || SAFE_METHODS.includes(req.method) || !isRelative(req)) {
    return next(req);
  }
  const document = inject(DOCUMENT);
  const http = inject(HttpClient);
  const token = () => readCookie(document.cookie, COOKIE);

  const ensureCookie = token()
    ? of(undefined)
    : http.get('/sanctum/csrf-cookie').pipe(map(() => undefined));

  return ensureCookie.pipe(
    switchMap(() =>
      defer(() => {
        const value = token();
        return next(value ? req.clone({ headers: req.headers.set(HEADER, value) }) : req);
      }),
    ),
  );
};

function isRelative(req: HttpRequest<unknown>): boolean {
  return req.url.startsWith('/') && !req.url.startsWith('//');
}

function readCookie(cookies: string, name: string): string | null {
  const entry = cookies
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}
