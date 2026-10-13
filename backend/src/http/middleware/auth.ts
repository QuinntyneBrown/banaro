import { t } from '../../services/user-experience/catalogue-service';
import { HttpError } from '../errors';
import type { Middleware } from '../pipeline';

/** No session: the app opens the session-expired dialog on this code (L2-005 criterion 1). */
export const auth: Middleware = async (ctx, next) => {
  if (!ctx.user) {
    throw new HttpError(401, { code: 'unauthenticated', message: t('identity.session.expired') });
  }
  return next();
};
