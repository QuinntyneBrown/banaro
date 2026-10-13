import { securityHeaders as headers } from '../../config/security';
import type { Middleware } from '../pipeline';

export const securityHeaders: Middleware = async (_, next) => {
  const response = await next();
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
};
