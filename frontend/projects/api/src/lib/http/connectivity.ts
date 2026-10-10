import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

export type ConnectivityStatus = 'online' | 'reconnecting' | 'offline' | 'failed';
export type ConnectionBannerState = 'warning' | 'info' | 'danger' | 'success' | null;

const RECONNECTING_AFTER_MS = 3_000;
const PROBE_EVERY_MS = 5_000;
const FAILED_AFTER_PROBES = 6;

/**
 * Tracks whether Banaro is reachable (L2-028 criteria 6 and 9, L2-043). The browser's online and
 * offline events and the outcome of API requests feed it; while not online it probes
 * `/health/live`, which touches no dependency. On the server it always reports online.
 */
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly status = signal<ConnectivityStatus>('online');
  /** True for a moment after the connection returns, so the shell can say so. */
  readonly recovered = signal(false);
  /** The member closed the danger banner; it returns if the connection fails again. */
  private readonly failureDismissed = signal(false);
  readonly banner = computed<ConnectionBannerState>(() => {
    switch (this.status()) {
      case 'offline':
        return 'warning';
      case 'reconnecting':
        return 'info';
      case 'failed':
        return this.failureDismissed() ? null : 'danger';
      default:
        return this.recovered() ? 'success' : null;
    }
  });

  private unreachableTimer?: ReturnType<typeof setTimeout>;
  private probeTimer?: ReturnType<typeof setInterval>;
  private failedProbes = 0;

  constructor() {
    if (!this.browser) return;
    const window = this.document.defaultView;
    const onOffline = () => this.wentOffline();
    const onOnline = () => void this.probe();
    window?.addEventListener('offline', onOffline);
    window?.addEventListener('online', onOnline);
    inject(DestroyRef).onDestroy(() => {
      window?.removeEventListener('offline', onOffline);
      window?.removeEventListener('online', onOnline);
      this.stopTimers();
    });
  }

  /** An API request got no response although the browser reports it is online. */
  reportUnreachable(): void {
    if (!this.browser || this.status() !== 'online' || this.unreachableTimer) return;
    if (this.document.defaultView?.navigator.onLine === false) return this.wentOffline();
    this.unreachableTimer = setTimeout(() => {
      this.unreachableTimer = undefined;
      this.status.set('reconnecting');
      this.startProbing();
    }, RECONNECTING_AFTER_MS);
  }

  /** An API request succeeded. */
  reportReachable(): void {
    clearTimeout(this.unreachableTimer);
    this.unreachableTimer = undefined;
    if (this.status() !== 'online') this.backOnline();
  }

  /** "Try again": probe at once. */
  retry(): Promise<boolean> {
    return this.probe();
  }

  dismissRecovered(): void {
    this.recovered.set(false);
  }

  dismissFailure(): void {
    this.failureDismissed.set(true);
  }

  private wentOffline(): void {
    clearTimeout(this.unreachableTimer);
    this.unreachableTimer = undefined;
    this.recovered.set(false);
    this.status.set('offline');
    this.startProbing();
  }

  private startProbing(): void {
    if (this.probeTimer) return;
    this.failedProbes = 0;
    this.probeTimer = setInterval(() => void this.probe(), PROBE_EVERY_MS);
  }

  private async probe(): Promise<boolean> {
    try {
      const response = await fetch('/health/live', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      this.backOnline();
      return true;
    } catch {
      this.failedProbes++;
      const browserOffline = this.document.defaultView?.navigator.onLine === false;
      if (browserOffline) this.status.set('offline');
      else if (this.failedProbes >= FAILED_AFTER_PROBES && this.status() !== 'failed') {
        this.failureDismissed.set(false);
        this.status.set('failed');
      } else if (this.status() === 'online' || this.status() === 'offline')
        this.status.set('reconnecting');
      this.startProbing();
      return false;
    }
  }

  private backOnline(): void {
    const wasDown = this.status() !== 'online';
    this.stopTimers();
    this.failedProbes = 0;
    this.status.set('online');
    if (wasDown) this.recovered.set(true);
  }

  private stopTimers(): void {
    clearTimeout(this.unreachableTimer);
    clearInterval(this.probeTimer);
    this.unreachableTimer = undefined;
    this.probeTimer = undefined;
  }
}

/** Reports every API outcome to the connectivity service: no response means unreachable. */
export const connectivityInterceptor: HttpInterceptorFn = (req, next) => {
  const connectivity = inject(ConnectivityService);
  return next(req).pipe(
    tap(() => connectivity.reportReachable()),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 0)
        connectivity.reportUnreachable();
      else connectivity.reportReachable();
      return throwError(() => error);
    }),
  );
};
