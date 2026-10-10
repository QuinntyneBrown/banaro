import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';

/**
 * Origin of the Banaro API for server-side rendering, such as `http://banaro-api:8000`. The browser
 * leaves it unset and calls `/api` on its own origin.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

/** Prefixes root-relative API paths with `API_BASE_URL` when one is provided. */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const base = inject(API_BASE_URL, { optional: true });
  return base && req.url.startsWith('/')
    ? next(req.clone({ url: `${base}${req.url}` }))
    : next(req);
};
