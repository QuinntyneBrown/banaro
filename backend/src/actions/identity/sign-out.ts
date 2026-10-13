import type { Ctx } from '../../http/pipeline';

/** Destroys the server session and issues a fresh CSRF token (L2-003 criterion 5). */
export function signOut(ctx: Ctx): void {
  ctx.session?.invalidate();
  ctx.user = null;
}
