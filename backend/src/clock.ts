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

/** A stamp as ISO 8601 with the Toronto offset, such as `2026-10-11T11:58:00-04:00`. */
export function isoStamp(stamp: string): string {
  const moment = fromStamp(stamp);
  const offsetMinutes = Math.round(
    (new Date(`${stamp.replace(' ', 'T')}Z`).getTime() - moment.getTime()) / 60000,
  );
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${stamp.replace(' ', 'T')}${sign}${hh}:${mm}`;
}

/** The moment a stamp names. */
export function fromStamp(stamp: string): Date {
  const asUtc = new Date(`${stamp.replace(' ', 'T')}Z`);
  const offset = asUtc.getTime() - new Date(`${toStamp(asUtc).replace(' ', 'T')}Z`).getTime();
  return new Date(asUtc.getTime() + offset);
}
