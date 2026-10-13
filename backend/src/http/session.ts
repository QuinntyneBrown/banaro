import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Redis } from 'ioredis';

export const SESSION_COOKIE = 'banaro_session';
export const CSRF_COOKIE = 'XSRF-TOKEN';
/** 30 days without a request ends a session (L2-005). */
const LIFETIME_SECONDS = Number(process.env.SESSION_LIFETIME ?? 43200) * 60;

export interface SessionData {
  csrf: string;
  /** Unix seconds of the last request; 30 idle days end the session (L2-005). */
  lastActivity?: number;
  userId?: number;
  /** Unix seconds of the sign-in, for the 90-day absolute lifetime (L2-005 criterion 5). */
  authenticatedAt?: number;
  /** Hash of the password at sign-in; a change ends the session (L2-004). */
  passwordHash?: string;
}

/** A server-side session in Redis, named by a signed cookie (ADR-0011). */
export class Session {
  /** The id this session had when the request began, deleted from Redis once it changes. */
  private readonly loadedId: string | null;

  private constructor(
    public id: string,
    public data: SessionData,
    loaded: boolean,
  ) {
    this.loadedId = loaded ? id : null;
  }

  static start(): Session {
    return new Session(randomId(), { csrf: randomId() }, false);
  }

  static async load(redis: Redis, cookie: string | undefined): Promise<Session | null> {
    const id = cookie ? verify(cookie) : null;
    const stored = id ? await redis.get(key(id)) : null;
    if (!stored) return null;
    const data = JSON.parse(stored) as SessionData;
    if (now() - (data.lastActivity ?? 0) > LIFETIME_SECONDS) return null;
    return new Session(id!, data, true);
  }

  /** A new id for the same data, so a session id seen before sign-in is useless after it. */
  regenerate(): void {
    this.id = randomId();
  }

  /** Empties the session under a new id with a new CSRF token, as at sign-out. */
  invalidate(): void {
    this.id = randomId();
    this.data = { csrf: randomId() };
  }

  async save(redis: Redis): Promise<void> {
    this.data.lastActivity = now();
    await redis.set(key(this.id), JSON.stringify(this.data), 'EX', LIFETIME_SECONDS);
    if (this.loadedId && this.loadedId !== this.id) await redis.del(key(this.loadedId));
  }

  /** The session and CSRF cookies; the browser script reads only the CSRF one. */
  cookies(): string[] {
    const expires = new Date(Date.now() + LIFETIME_SECONDS * 1000).toUTCString();
    const domain = process.env.SESSION_DOMAIN ? `; domain=${process.env.SESSION_DOMAIN}` : '';
    const common = `expires=${expires}; Max-Age=${LIFETIME_SECONDS}; path=/${domain}; secure; samesite=lax`;
    return [
      `${SESSION_COOKIE}=${sign(this.id)}; ${common}; httponly`,
      `${CSRF_COOKIE}=${this.data.csrf}; ${common}`,
    ];
  }

  csrfMatches(token: string | null): boolean {
    const expected = Buffer.from(this.data.csrf);
    const given = Buffer.from(token ?? '');
    return given.length === expected.length && timingSafeEqual(given, expected);
  }
}

const key = (id: string) => `banaro:session:${id}`;
const now = () => Math.floor(Date.now() / 1000);
const randomId = () => randomBytes(30).toString('base64url');

function secret(): string {
  return createHash('sha256')
    .update(`session|${process.env.APP_KEY ?? ''}`)
    .digest('hex');
}

function sign(id: string): string {
  return `${id}.${createHmac('sha256', secret()).update(id).digest('base64url')}`;
}

function verify(cookie: string): string | null {
  const [id, signature] = cookie.split('.');
  if (!id || !signature) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(cookie);
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null;
}

/** Reads one cookie from a Cookie header. */
export function readCookie(req: Request, name: string): string | undefined {
  for (const part of (req.headers.get('Cookie') ?? '').split(';')) {
    const [cookieName, ...value] = part.trim().split('=');
    if (cookieName === name) return decodeURIComponent(value.join('='));
  }
  return undefined;
}
