import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DistancePipe, TranslatePipe, TranslationService } from 'api';
import { Button } from 'components';
import { SeoService } from '../../shared/seo.service';

@Component({
  selector: 'bn-home-page',
  imports: [Button, NgTemplateOutlet, RouterLink, TranslatePipe, DistancePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  constructor() {
    const i18n = inject(TranslationService);
    inject(SeoService).set({
      title: i18n.t('home.meta.title'),
      description: i18n.t('home.meta.description'),
      path: '/',
    });
  }
}
