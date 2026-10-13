/// <reference types="vite/client" />
import type { Middleware } from '../../src/http/pipeline';
import { PUBLIC_ROUTES } from '../../src/http/public-routes';
import type { Handler } from './browser';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

type RouteModule = Partial<Record<(typeof METHODS)[number], Handler>> & {
  stack: Middleware[] | Partial<Record<string, Middleware[]>>;
};

export interface RouteEntry {
  /** Such as `PUT /api/v1/projects/[project]`. */
  key: string;
  method: string;
  path: string;
  handler: Handler;
  stack: Middleware[];
}

const modules = import.meta.glob('../../app/**/route.ts', { eager: true }) as unknown as Record<
  string,
  RouteModule
>;

/** Every method of every route file, with the middleware stack it runs. */
export function routes(): RouteEntry[] {
  return Object.entries(modules).flatMap(([file, module]) => {
    const path = file.replace('../../app', '').replace(/\/route\.ts$/, '');
    return METHODS.flatMap((method) => {
      const handler = module[method];
      if (!handler) return [];
      const stack = Array.isArray(module.stack) ? module.stack : (module.stack[method] ?? []);
      return [{ key: `${method} ${path}`, method, path, handler, stack }];
    });
  });
}

/** The routes that need a signed-in member: every route not in `PUBLIC_ROUTES`. */
export const authenticatedRoutes = () =>
  routes().filter((route) => !PUBLIC_ROUTES.includes(route.key));

/** The route's path with each parameter replaced by the given value. */
export const fillPath = (path: string, params: Record<string, string>) =>
  path.replace(/\[(\w+)\]/g, (_, name: string) => params[name] ?? 'x');

/** The parameter names in a route's path. */
export const paramNames = (path: string) =>
  [...path.matchAll(/\[(\w+)\]/g)].map((match) => match[1]);
