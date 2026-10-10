import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectivityService, TranslatePipe, TranslationService } from 'api';
import { Button, ErrorPage } from 'components';
import { OfflineState } from '../../shared/router-error-page-navigator';
import { SeoService } from '../../shared/seo.service';

/**
 * Shown in place when a page cannot load because Banaro is unreachable. It is part of the main
 * bundle, because lazy page code cannot be fetched offline (L2-043 criterion 1).
 */
@Component({
  selector: 'bn-offline-page',
  imports: [Button, ErrorPage, TranslatePipe],
  template: `
    <div class="wrap">
      <bn-error-page
        icon="offline"
        [heading]="'errors.offline.heading' | t"
        [lead]="'errors.offline.lead' | t"
      >
        <div class="cluster">
          <button bn-button variant="primary" type="button" (click)="retry()">
            {{ 'errors.offline.retry' | t }}
          </button>
        </div>
      </bn-error-page>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflinePage {
  private readonly document = inject(DOCUMENT);
  private readonly connectivity = inject(ConnectivityService);
  private readonly failedUrl =
    (inject(Router).currentNavigation()?.extras.state as OfflineState | undefined)?.failedUrl ??
    null;

  constructor() {
    inject(SeoService).set({
      title: inject(TranslationService).t('errors.offline.title'),
      noindex: true,
    });
    // When the connection returns, load the page the person asked for.
    effect(() => {
      if (this.connectivity.status() === 'online' && this.connectivity.recovered()) this.retry();
    });
  }

  /** Loads the page afresh: browsers remember a failed code download until the page reloads. */
  protected retry(): void {
    this.document.location.assign(this.failedUrl ?? this.document.location.href);
  }
}
