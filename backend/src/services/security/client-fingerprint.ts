import { createHash, createHmac } from 'node:crypto';

/**
 * Keyed hashes that stand in for a client in rate-limit keys and logs, so no raw address is stored
 * or logged (L2-046 criterion 3). The key is separate from APP_KEY so it can be rotated alone.
 */
export function clientHash(value: string): string {
  const key =
    process.env.BANARO_CLIENT_HASH_KEY ??
    createHash('sha256')
      .update(`client|${process.env.APP_KEY ?? ''}`)
      .digest('hex');
  return createHmac('sha256', key).update(value).digest('hex');
}

/**
 * The client's address as the nearest proxy recorded it: the last X-Forwarded-For entry. Next.js
 * fills the header from the socket when nothing in front of it did.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('X-Forwarded-For') ?? '';
  return forwarded.split(',').pop()?.trim() || 'unknown';
}
