import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslationService } from 'api';
import { Button, ErrorPage } from 'components';
import { SeoService } from '../../shared/seo.service';

/**
 * `/403`: what a member sees when the API refuses something that is not theirs (L2-042 criterion 2).
 * A visitor never gets here: a request without a session goes to sign-in instead.
 */
@Component({
  selector: 'bn-forbidden-page',
  imports: [Button, ErrorPage, RouterLink, TranslatePipe],
  template: `
    <div class="wrap">
      <bn-error-page
        code="403"
        [heading]="'errors.forbidden.heading' | t"
        [lead]="'errors.forbidden.lead' | t"
      >
        <div class="cluster">
          <a bn-button variant="primary" routerLink="/dashboard">{{ 'errors.dashboard' | t }}</a>
          <button bn-button variant="quiet" type="button" (click)="back()">
            {{ 'errors.forbidden.back' | t }}
          </button>
          <a bn-button variant="text" routerLink="/contact">{{ 'errors.forbidden.contact' | t }}</a>
        </div>
      </bn-error-page>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPage {
  private readonly location = inject(Location);

  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 403;
    inject(SeoService).set({
      title: inject(TranslationService).t('errors.forbidden.title'),
      noindex: true,
    });
  }

  protected back(): void {
    this.location.back();
  }
}
