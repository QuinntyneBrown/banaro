import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslationService } from 'api';
import { Button, PageHeader } from 'components';
import { SeoService } from '../../shared/seo.service';

@Component({
  selector: 'bn-about-page',
  imports: [Button, PageHeader, RouterLink, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  constructor() {
    const i18n = inject(TranslationService);
    inject(SeoService).set({
      title: i18n.t('about.meta.title'),
      description: i18n.t('about.meta.description'),
      path: '/about',
    });
  }
}
