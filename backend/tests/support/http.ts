type Handler = (
  req: Request,
  context: { params: Promise<Record<string, string> | undefined> },
) => Promise<Response>;

interface Options {
  json?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/** Calls a route handler in-process, as Next.js would. */
export function send(handler: Handler, method: string, path: string, options: Options = {}) {
  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  let body: string | undefined;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }
  return handler(new Request(`http://localhost:8100${path}`, { method, headers, body }), {
    params: Promise.resolve(options.params),
  });
}
