import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, RESPONSE_INIT } from '@angular/core';
import { Router } from '@angular/router';
import { formatTime, TranslatePipe, TranslationService } from 'api';
import { Button, ErrorPage } from 'components';
import { MaintenanceState } from '../../shared/router-error-page-navigator';
import { SeoService } from '../../shared/seo.service';

@Component({
  selector: 'bn-maintenance-page',
  imports: [Button, ErrorPage, TranslatePipe],
  templateUrl: './maintenance.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenancePage {
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(TranslationService);
  protected readonly lead: string;

  constructor() {
    const state = inject(Router).currentNavigation()?.extras.state as MaintenanceState | undefined;
    this.lead = state?.expectedBackAt
      ? this.i18n.t('errors.maintenance.leadAt', { time: formatTime(state.expectedBackAt) })
      : this.i18n.t('errors.maintenance.lead');

    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 503;
    inject(SeoService).set({ title: this.i18n.t('errors.maintenance.title'), noindex: true });
  }

  /** Retries the address the person was on; the page is shown without changing it. */
  protected checkAgain(): void {
    this.document.location.reload();
  }
}
