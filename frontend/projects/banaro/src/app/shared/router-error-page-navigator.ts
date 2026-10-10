import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorPageNavigator } from 'api';

/** Navigation state carried to the maintenance page. */
export interface MaintenanceState {
  expectedBackAt: string | null;
}

/** Navigation state carried to the offline page. */
export interface OfflineState {
  failedUrl: string;
}

/** Shows error pages in place, without changing the address, so a reload retries it. */
@Injectable()
export class RouterErrorPageNavigator implements ErrorPageNavigator {
  // The router is resolved lazily: interceptors are created before it.
  private readonly injector = inject(Injector);

  maintenance(expectedBackAt: string | null): void {
    const state: MaintenanceState = { expectedBackAt };
    this.injector.get(Router).navigate(['/maintenance'], { skipLocationChange: true, state });
  }

  offline(failedUrl: string): void {
    const state: OfflineState = { failedUrl };
    this.injector.get(Router).navigate(['/offline'], { skipLocationChange: true, state });
  }
}
