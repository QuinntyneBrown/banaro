import { RenderMode, ServerRoute } from '@angular/ssr';

// Pages read live data from the Banaro API, so every route renders per request.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
