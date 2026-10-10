import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { ApplicationConfig, inject, mergeApplicationConfig, REQUEST } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { API_BASE_URL } from 'api';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const apiBaseUrl = process.env['BANARO_API_URL'] ?? 'http://localhost:8100';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: API_BASE_URL, useValue: apiBaseUrl },
    // The server calls the API directly; the browser calls it on its own origin. Map one to the
    // other so hydration reuses the server's responses.
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => {
        const request = inject(REQUEST, { optional: true });
        return request ? { [apiBaseUrl]: new URL(request.url).origin } : {};
      },
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
