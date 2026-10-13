import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';

/**
 * During server-side rendering, API calls carry the browser's cookies and its page URL as the
 * Referer, so the API sees the same first-party session the browser would. In the browser this
 * does nothing: the browser sends its own cookies.
 */
export const forwardRequestCookiesInterceptor: HttpInterceptorFn = (req, next) => {
  const request = inject(REQUEST, { optional: true });
  if (!request || !req.url.startsWith('/') || req.url.startsWith('//')) return next(req);

  let headers = req.headers.set('Referer', request.url);
  const cookie = request.headers.get('cookie');
  if (cookie) headers = headers.set('Cookie', cookie);
  return next(req.clone({ headers }));
};
