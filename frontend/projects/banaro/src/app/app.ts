import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslationService } from 'api';
import { Footer, NavItem, SkipLink, ThemeService } from 'components';
import { Header } from './shell/header/header';
import { ThemeShortcut } from './shell/theme-shortcut';

@Component({
  imports: [RouterOutlet, Header, Footer, SkipLink, TranslatePipe],
  selector: 'bn-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [ThemeShortcut],
})
export class App {
  private readonly i18n = inject(TranslationService);
  // Applies the stored theme before the first render, on the server and in the browser.
  private readonly theme = inject(ThemeService);

  protected readonly year = new Date().getFullYear();

  protected readonly footerLinks = computed<NavItem[]>(() => [
    { label: this.i18n.t('common.footer.about'), link: '/about' },
    { label: this.i18n.t('common.footer.codeOfConduct'), link: '/code-of-conduct' },
    { label: this.i18n.t('common.footer.privacy'), link: '/privacy' },
    { label: this.i18n.t('common.footer.contact'), link: '/contact' },
  ]);
}
