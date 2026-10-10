import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatLongDate, TranslatePipe, TranslationService } from 'api';
import { PageHeader } from 'components';
import { SeoService } from '../../shared/seo.service';

/** Date of the current policy version (L2-041 criterion 2). */
export const PRIVACY_POLICY_UPDATED = '2026-10-09';

@Component({
  selector: 'bn-privacy-page',
  imports: [PageHeader, RouterLink, TranslatePipe],
  templateUrl: './privacy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPage {
  protected readonly updated = PRIVACY_POLICY_UPDATED;
  protected readonly updatedLabel = formatLongDate(PRIVACY_POLICY_UPDATED);

  constructor() {
    const i18n = inject(TranslationService);
    inject(SeoService).set({
      title: i18n.t('privacy.meta.title'),
      description: i18n.t('privacy.meta.description'),
      path: '/privacy',
    });
  }
}
