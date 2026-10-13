import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatLongDate, TranslatePipe, TranslationService } from 'api';
import { PageHeader } from 'components';
import { SeoService } from '../../shared/seo.service';

/**
 * Date of the code-of-conduct version members accept; it matches `banaro.code_of_conduct_version`
 * on the API, so raising one means raising the other (L2-034, decision D-025).
 */
export const CODE_OF_CONDUCT_UPDATED = '2026-09-01';

/** Section ids double as the table-of-contents fragments. */
const SECTIONS = [
  { id: 'be-kind', titleKey: 'conduct.beKind.title' },
  { id: 'welcoming', titleKey: 'conduct.welcoming.title' },
  { id: 'ask-first', titleKey: 'conduct.askFirst.title' },
  { id: 'keep-people-safe', titleKey: 'conduct.keepPeopleSafe.title' },
  { id: 'if-something-goes-wrong', titleKey: 'conduct.ifSomethingGoesWrong.title' },
];

@Component({
  selector: 'bn-code-of-conduct-page',
  imports: [PageHeader, RouterLink, TranslatePipe],
  templateUrl: './code-of-conduct.html',
  styleUrl: './code-of-conduct.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeOfConductPage {
  protected readonly updated = CODE_OF_CONDUCT_UPDATED;
  protected readonly updatedLabel = formatLongDate(CODE_OF_CONDUCT_UPDATED);
  protected readonly sections = SECTIONS;

  constructor() {
    const i18n = inject(TranslationService);
    inject(SeoService).set({
      title: i18n.t('conduct.meta.title'),
      description: i18n.t('conduct.meta.description'),
      path: '/code-of-conduct',
    });
  }
}
