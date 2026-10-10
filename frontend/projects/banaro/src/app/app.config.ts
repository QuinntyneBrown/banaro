import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import {
  connectivityInterceptor,
  ConnectivityService,
  csrfCookieInterceptor,
  ERROR_PAGE_NAVIGATOR,
  HttpI18nApi,
  HttpIdentityApi,
  HttpPublicSiteApi,
  I18N_API,
  IDENTITY_API,
  maintenanceInterceptor,
  provideI18n,
  PUBLIC_SITE_API,
} from 'api';
import { routes } from './app.routes';
import { AppErrorHandler } from './shared/app-error-handler';
import { RouterErrorPageNavigator } from './shared/router-error-page-navigator';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideRouter(
      routes,
      // A page whose code cannot load while Banaro is unreachable shows the offline page.
      withNavigationErrorHandler((error) => {
        const browserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
        if (browserOffline || inject(ConnectivityService).status() !== 'online') {
          inject(ERROR_PAGE_NAVIGATOR).offline(error.url);
        }
      }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([connectivityInterceptor, csrfCookieInterceptor, maintenanceInterceptor]),
    ),
    provideClientHydration(withHttpTransferCacheOptions({})),
    { provide: I18N_API, useClass: HttpI18nApi },
    { provide: PUBLIC_SITE_API, useClass: HttpPublicSiteApi },
    { provide: IDENTITY_API, useClass: HttpIdentityApi },
    { provide: ERROR_PAGE_NAVIGATOR, useClass: RouterErrorPageNavigator },
    provideI18n('en-CA'),
  ],
};
