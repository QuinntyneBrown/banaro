import { GET as csrfCookie } from '../../app/sanctum/csrf-cookie/route';

export type Handler = (
  req: Request,
  context: { params: Promise<Record<string, string> | undefined> },
) => Promise<Response>;

interface Options {
  json?: unknown;
  /** A raw body, such as a multipart form. */
  body?: RequestInit['body'];
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * A first-party browser: it sends Banaro Web's Origin, keeps cookies, and echoes the XSRF-TOKEN
 * cookie on state-changing requests, fetching it first as the Angular client does.
 */
export class Browser {
  readonly cookies = new Map<string, string>();

  constructor(public ip = '10.0.0.1') {}

  get = (handler: Handler, path: string, options?: Options) =>
    this.send(handler, 'GET', path, options);
  post = (handler: Handler, path: string, options?: Options) =>
    this.send(handler, 'POST', path, options);
  put = (handler: Handler, path: string, options?: Options) =>
    this.send(handler, 'PUT', path, options);
  delete = (handler: Handler, path: string, options?: Options) =>
    this.send(handler, 'DELETE', path, options);

  async send(handler: Handler, method: string, path: string, options: Options = {}) {
    if (method !== 'GET' && !this.cookies.has('XSRF-TOKEN')) {
      await this.send(csrfCookie, 'GET', '/sanctum/csrf-cookie');
    }
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Origin: 'http://localhost:4300',
      'X-Forwarded-For': this.ip,
      Cookie: [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; '),
    };
    if (method !== 'GET') {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(this.cookies.get('XSRF-TOKEN') ?? '');
    }
    let body: RequestInit['body'] = options.body;
    if (options.json !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.json);
    }
    const response = await handler(
      new Request(`http://localhost:8100${path}`, {
        method,
        headers: { ...headers, ...options.headers },
        body,
      }),
      { params: Promise.resolve(options.params) },
    );
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const [name, ...value] = pair.split('=');
      if (/max-age=0\b/i.test(cookie)) this.cookies.delete(name);
      else this.cookies.set(name, value.join('='));
    }
    return response;
  }
}
