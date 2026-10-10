import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  csrfCookieInterceptor,
  HttpI18nApi,
  HttpPublicSiteApi,
  I18N_API,
  provideI18n,
  PUBLIC_SITE_API,
} from 'api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([csrfCookieInterceptor])),
    provideClientHydration(withHttpTransferCacheOptions({})),
    { provide: I18N_API, useClass: HttpI18nApi },
    { provide: PUBLIC_SITE_API, useClass: HttpPublicSiteApi },
    provideI18n('en-CA'),
  ],
};
