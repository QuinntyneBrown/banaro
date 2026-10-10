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
