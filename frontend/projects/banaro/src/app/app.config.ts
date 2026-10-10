import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { apiBaseUrlInterceptor, HttpI18nApi, I18N_API, provideI18n } from 'api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiBaseUrlInterceptor])),
    provideClientHydration(withHttpTransferCacheOptions({})),
    { provide: I18N_API, useClass: HttpI18nApi },
    provideI18n('en-CA'),
  ],
};
