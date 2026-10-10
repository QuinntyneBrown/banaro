import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  computed,
  ErrorHandler,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import {
  connectivityInterceptor,
  ConnectivityService,
  csrfCookieInterceptor,
  ERROR_PAGE_NAVIGATOR,
  forwardRequestCookiesInterceptor,
  HttpI18nApi,
  HttpIdentityApi,
  HttpProfilesApi,
  HttpPublicSiteApi,
  I18N_API,
  IDENTITY_API,
  maintenanceInterceptor,
  provideI18n,
  provideSession,
  PROFILES_API,
  PUBLIC_SITE_API,
  SESSION_RECOVERY,
  sessionExpiryInterceptor,
  TranslationService,
} from 'api';
import { TOAST_DISMISS_LABEL } from 'components';
import { routes } from './app.routes';
import { AppErrorHandler } from './shared/app-error-handler';
import { DialogSessionRecovery } from './shared/dialog-session-recovery';
import { RouterErrorPageNavigator } from './shared/router-error-page-navigator';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Table-of-contents links jump to their section (L2-034).
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
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
      withInterceptors([
        forwardRequestCookiesInterceptor,
        connectivityInterceptor,
        // Before the CSRF interceptor, so a request retried after sign-in carries the new token.
        sessionExpiryInterceptor,
        csrfCookieInterceptor,
        maintenanceInterceptor,
      ]),
    ),
    // The page HTML is private to its viewer (server.ts), so it may carry their own API responses:
    // the browser then reuses what server-side rendering fetched instead of asking again.
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
        includeNonCacheableRequests: true,
        // Opening a verification link is a POST made while rendering on the server; the browser
        // must reuse its answer rather than open the link a second time.
        includePostRequests: true,
      }),
    ),
    { provide: I18N_API, useClass: HttpI18nApi },
    { provide: PUBLIC_SITE_API, useClass: HttpPublicSiteApi },
    { provide: IDENTITY_API, useClass: HttpIdentityApi },
    { provide: PROFILES_API, useClass: HttpProfilesApi },
    { provide: ERROR_PAGE_NAVIGATOR, useClass: RouterErrorPageNavigator },
    { provide: SESSION_RECOVERY, useClass: DialogSessionRecovery },
    {
      provide: TOAST_DISMISS_LABEL,
      useFactory: () => {
        const i18n = inject(TranslationService);
        return computed(() => i18n.t('common.toast.dismiss'));
      },
    },
    provideI18n('en-CA'),
    provideSession(),
  ],
};
