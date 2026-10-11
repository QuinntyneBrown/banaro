import { Pipe, PipeTransform } from '@angular/core';

/** Banaro formats every value for Toronto (L2-052). */
export const LOCALE = 'en-CA';
export const TIME_ZONE = 'America/Toronto';

/** "1,284" — comma thousands separator. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** "5.8 km" under 10 km, "27 km" from 10 km. */
export function formatDistance(km: number): string {
  const rounded = Math.round(km * 10) / 10;
  return rounded < 10 ? `${rounded.toFixed(1)} km` : `${Math.round(rounded)} km`;
}

/** "9 October 2026" for a calendar date such as `2026-10-09`: day first, as in L2-052. */
export function formatLongDate(isoDate: string): string {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(new Date(`${isoDate}T00:00:00Z`));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return `${part('day')} ${part('month')} ${part('year')}`;
}

/** "10:30 am" in Toronto time, lower case without dots (L2-052 criterion 2). */
export function formatTime(iso: string | Date): string {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TIME_ZONE,
  }).formatToParts(typeof iso === 'string' ? new Date(iso) : iso);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  const period = part('dayPeriod').toLowerCase().replace(/\./g, '').replace(/\s/g, '');
  return `${part('hour')}:${part('minute')} ${period}`;
}

@Pipe({ name: 'bnNumber' })
export class NumberPipe implements PipeTransform {
  transform(value: number): string {
    return formatNumber(value);
  }
}

@Pipe({ name: 'bnDistance' })
export class DistancePipe implements PipeTransform {
  transform(km: number): string {
    return formatDistance(km);
  }
}

/** "13 KB" under 1 MB, "1.2 MB" from 1 MB, in binary units as upload limits are (L2-008). */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${formatNumber(Math.max(1, Math.round(bytes / 1024)))} KB`;
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(mb)} MB`;
}

/** How long ago a builder was last seen, in the unit the presence word uses (D-043). */
export type LastSeen =
  | { unit: 'minutes' | 'hours' | 'days' | 'weeks'; count: number }
  | { unit: 'yesterday' | 'longAgo' };

export function lastSeen(iso: string, now: Date = new Date()): LastSeen {
  const minutes = Math.max(1, Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return { unit: 'minutes', count: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { unit: 'hours', count: hours };
  if (hours < 48) return { unit: 'yesterday' };
  const days = Math.floor(hours / 24);
  if (days < 7) return { unit: 'days', count: days };
  if (days < 30) return { unit: 'weeks', count: Math.floor(days / 7) };
  return { unit: 'longAgo' };
}
