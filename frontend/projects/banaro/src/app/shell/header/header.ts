import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslationService } from 'api';
import { Button, NavItem, TopBar } from 'components';

@Component({
  selector: 'bn-header',
  imports: [TopBar, Button, RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly i18n = inject(TranslationService);

  protected readonly navItems = computed<NavItem[]>(() => [
    { label: this.i18n.t('common.nav.builders'), link: '/builders' },
    { label: this.i18n.t('common.nav.projects'), link: '/projects' },
    { label: this.i18n.t('common.nav.events'), link: '/events' },
    { label: this.i18n.t('common.nav.matching'), link: '/matching' },
  ]);
}
