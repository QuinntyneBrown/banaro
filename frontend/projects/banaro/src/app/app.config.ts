import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  connectivityInterceptor,
  csrfCookieInterceptor,
  ERROR_PAGE_NAVIGATOR,
  HttpI18nApi,
  HttpPublicSiteApi,
  I18N_API,
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
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([connectivityInterceptor, csrfCookieInterceptor, maintenanceInterceptor]),
    ),
    provideClientHydration(withHttpTransferCacheOptions({})),
    { provide: I18N_API, useClass: HttpI18nApi },
    { provide: PUBLIC_SITE_API, useClass: HttpPublicSiteApi },
    { provide: ERROR_PAGE_NAVIGATOR, useClass: RouterErrorPageNavigator },
    provideI18n('en-CA'),
  ],
};
