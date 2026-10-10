import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore, TranslatePipe, TranslationService } from 'api';
import {
  Avatar,
  Button,
  initialsOf,
  Menu,
  MenuDivider,
  MenuHeader,
  MenuItem,
  menuPositions,
  NavItem,
  ToastService,
  TopBar,
} from 'components';

@Component({
  selector: 'bn-header',
  imports: [
    TopBar,
    Button,
    Avatar,
    Menu,
    MenuItem,
    MenuHeader,
    MenuDivider,
    CdkMenuTrigger,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly i18n = inject(TranslationService);
  private readonly session = inject(SessionStore);
  private readonly toasts = inject(ToastService);

  protected readonly member = this.session.member;
  protected readonly initials = computed(() => initialsOf(this.member()?.name ?? ''));
  protected readonly firstName = computed(() => this.member()?.name.split(/\s+/)[0] ?? '');

  protected readonly accountMenuPositions = menuPositions('end');

  protected readonly navItems = computed<NavItem[]>(() => [
    { label: this.i18n.t('common.nav.builders'), link: '/builders' },
    { label: this.i18n.t('common.nav.projects'), link: '/projects' },
    { label: this.i18n.t('common.nav.events'), link: '/events' },
    { label: this.i18n.t('common.nav.matching'), link: '/matching' },
  ]);

  /**
   * The menu has already closed when an item triggers. A failed sign-out leaves the member signed
   * in and offers to try again (L2-003 criterion 11).
   */
  protected signOut(): void {
    this.session.signOut().subscribe({
      error: () =>
        this.toasts.show({
          variant: 'danger',
          title: this.i18n.t('identity.signOut.failed.title'),
          body: this.i18n.t('identity.signOut.failed.body'),
          action: {
            label: this.i18n.t('identity.signOut.failed.retry'),
            run: () => this.signOut(),
          },
        }),
    });
  }
}
