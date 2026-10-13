import { timestamp } from 'drizzle-orm/pg-core';

/** `timestamp(0) without time zone`, read as Toronto wall-clock text (ADR-0008). */
export const stamp = (name: string) => timestamp(name, { precision: 0, mode: 'string' });
