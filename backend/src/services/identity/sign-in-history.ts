import { createHash } from 'node:crypto';
import { isIPv4, isIPv6 } from 'node:net';
import { and, eq, gte, lt } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { signIns } from '../../db/schema/users';
import { t } from '../user-experience/catalogue-service';

const REMEMBER_DAYS = 90;

/**
 * Records a sign-in. A device is the browser family plus the IP network (/24 for IPv4, /48 for
 * IPv6), hashed and remembered for 90 days. True when it is a new device on an account that signed
 * in before (L2-003 criterion 10).
 */
export async function recordSignIn(
  db: pg.Pool,
  userId: number,
  userAgent: string,
  ip: string,
): Promise<boolean> {
  const since = nowStamp(-REMEMBER_DAYS * 24 * 3600);
  const device = createHash('sha256')
    .update(`${browserName(userAgent)}|${network(ip)}`)
    .digest('hex');
  const query = orm(db);

  const [history] = await query
    .select({ id: signIns.id })
    .from(signIns)
    .where(eq(signIns.userId, userId))
    .limit(1);
  const [known] = await query
    .select({ id: signIns.id })
    .from(signIns)
    .where(
      and(
        eq(signIns.userId, userId),
        eq(signIns.deviceHash, device),
        gte(signIns.createdAt, since),
      ),
    )
    .limit(1);
  await query.delete(signIns).where(and(eq(signIns.userId, userId), lt(signIns.createdAt, since)));
  await query.insert(signIns).values({ userId, deviceHash: device, createdAt: nowStamp() });

  return history !== undefined && known === undefined;
}

/** "Firefox on macOS", from the user agent; enough to recognise a device, never stored. */
export function browserName(userAgent: string): string {
  const browser = [
    ['Edg/', 'Edge'],
    ['OPR/', 'Opera'],
    ['Firefox/', 'Firefox'],
    ['Chrome/', 'Chrome'],
    ['Safari/', 'Safari'],
  ].find(([marker]) => userAgent.includes(marker))?.[1];
  const system = [
    ['iPhone', 'iOS'],
    ['iPad', 'iOS'],
    ['Android', 'Android'],
    ['Windows', 'Windows'],
    ['Mac OS X', 'macOS'],
    ['Linux', 'Linux'],
  ].find(([marker]) => userAgent.includes(marker))?.[1];

  if (!browser) return t('email.newSignIn.unknownBrowser');
  return system ? t('email.newSignIn.browserOn', { browser, system }) : browser;
}

function network(ip: string): string {
  if (isIPv4(ip)) return ip.replace(/\.\d+$/, '.0');
  if (isIPv6(ip)) {
    const [head, tail = ''] = ip.split('::');
    const left = head ? head.split(':') : [];
    const right = tail ? tail.split(':') : [];
    const groups = [...left, ...Array(8 - left.length - right.length).fill('0'), ...right];
    return `${groups.slice(0, 3).join(':')}::`;
  }
  return ip;
}
