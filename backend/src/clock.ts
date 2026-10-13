const ZONE = 'America/Toronto';

const format = new Intl.DateTimeFormat('sv-SE', {
  timeZone: ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/**
 * A moment as the database stores it: Toronto wall-clock text in a `timestamp without time zone`
 * column, as the Laravel API and the e2e fixtures write it (ADR-0008).
 */
export function toStamp(date: Date): string {
  return format.format(date);
}

/** The current moment as a stamp; tests move it with fake timers. */
export function nowStamp(offsetSeconds = 0): string {
  return toStamp(new Date(Date.now() + offsetSeconds * 1000));
}

/** The moment a stamp names. */
export function fromStamp(stamp: string): Date {
  const asUtc = new Date(`${stamp.replace(' ', 'T')}Z`);
  const offset = asUtc.getTime() - new Date(`${toStamp(asUtc).replace(' ', 'T')}Z`).getTime();
  return new Date(asUtc.getTime() + offset);
}
