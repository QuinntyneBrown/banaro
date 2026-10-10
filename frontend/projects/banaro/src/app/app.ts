import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslationService } from 'api';
import { Footer, NavItem, SkipLink } from 'components';
import { Header } from './shell/header/header';

@Component({
  imports: [RouterOutlet, Header, Footer, SkipLink, TranslatePipe],
  selector: 'bn-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly i18n = inject(TranslationService);

  protected readonly year = new Date().getFullYear();

  protected readonly footerLinks = computed<NavItem[]>(() => [
    { label: this.i18n.t('common.footer.about'), link: '/about' },
    { label: this.i18n.t('common.footer.codeOfConduct'), link: '/code-of-conduct' },
    { label: this.i18n.t('common.footer.privacy'), link: '/privacy' },
    { label: this.i18n.t('common.footer.contact'), link: '/contact' },
  ]);
}
