import { isPlatformBrowser } from '@angular/common';
import { ErrorHandler, inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectivityService } from 'api';
import { ServerErrorState } from '../pages/server-error/server-error';

/**
 * Shows the server-error page for an error the application did not handle. Browser errors go
 * to the console only and carry no reference ID (L2-042 criteria 4 and 6).
 */
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private showing = false;

  /** Failures while Banaro is unreachable belong to the offline page and the connection banner. */
  private unreachable(): boolean {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return offline || this.injector.get(ConnectivityService).status() !== 'online';
  }

  handleError(error: unknown): void {
    console.error(error);
    if (!this.browser || this.showing || this.unreachable()) return;
    this.showing = true;
    showServerError(this.injector.get(Router), {}).finally(() => (this.showing = false));
  }
}

/** Shows the server-error page without changing the address, so "Try again" reloads it. */
export function showServerError(router: Router, state: ServerErrorState): Promise<boolean> {
  return router.navigate(['/500'], { skipLocationChange: true, state });
}
