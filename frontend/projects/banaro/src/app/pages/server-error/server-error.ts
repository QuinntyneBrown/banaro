import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, RESPONSE_INIT } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslationService } from 'api';
import { Button, ErrorPage } from 'components';
import { SeoService } from '../../shared/seo.service';

/** Navigation state carried to the server-error page. */
export interface ServerErrorState {
  /** The API's request ID when an API response failed; absent for browser errors (L2-042). */
  requestId?: string;
}

@Component({
  selector: 'bn-server-error-page',
  imports: [Button, ErrorPage, RouterLink, TranslatePipe],
  templateUrl: './server-error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerErrorPage {
  private readonly document = inject(DOCUMENT);
  protected readonly requestId =
    (inject(Router).currentNavigation()?.extras.state as ServerErrorState | undefined)?.requestId ??
    null;

  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 500;
    inject(SeoService).set({
      title: inject(TranslationService).t('errors.serverError.title'),
      noindex: true,
    });
  }

  /** Reloads the address the person was on; the page is shown without changing it. */
  protected retry(): void {
    this.document.location.reload();
  }
}
