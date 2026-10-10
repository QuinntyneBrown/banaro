import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { request as httpRequest } from 'node:http';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Same-origin API: `/api`, `/sanctum` and `/health` go to the Banaro API, so the browser and
 * server-side rendering both call relative URLs and session cookies stay first-party. The dev
 * server does the same through proxy.conf.json.
 */
const apiUrl = new URL(process.env['BANARO_API_URL'] ?? 'http://localhost:8100');
app.use(['/api', '/sanctum', '/health'], (req, res) => {
  // Hop-by-hop headers describe the browser's connection, not this one (RFC 9110 §7.6.1).
  const headers = { ...req.headers };
  delete headers.connection;
  delete headers['keep-alive'];
  const upstream = httpRequest(
    {
      protocol: apiUrl.protocol,
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      method: req.method,
      path: req.originalUrl,
      headers: {
        ...headers,
        'x-forwarded-for': [req.headers['x-forwarded-for'], req.socket.remoteAddress]
          .filter(Boolean)
          .join(', '),
        'x-forwarded-proto': req.protocol,
        'x-forwarded-host': req.headers.host ?? '',
      },
    },
    (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) res.status(502).json({ message: 'Bad Gateway' });
  });
  req.pipe(upstream);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (!response) return next();
      // Pages vary by the theme and session cookies; never let a shared cache serve them.
      response.headers.set('Vary', 'Cookie');
      response.headers.set('Cache-Control', 'private, no-cache');
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
