import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslationService } from 'api';
import { NavItem, PageHeader, SidebarNavigation } from 'components';

/**
 * `/settings/*`: the member's settings with one section per route (L2-035, L2-036, L2-037). The nav
 * lists the sections that exist so far (D-047).
 */
@Component({
  selector: 'bn-settings-page',
  imports: [PageHeader, RouterOutlet, SidebarNavigation, TranslatePipe],
  template: `
    <div class="wrap">
      <bn-page-header
        [eyebrow]="'settings.eyebrow' | t"
        [heading]="'settings.title' | t"
        [sub]="'settings.sub' | t"
      />
      <div class="settings-layout">
        <bn-sidebar-navigation [label]="'settings.nav.label' | t" [items]="sections()" />
        <div><router-outlet /></div>
      </div>
    </div>
  `,
  styles: `
    /* Extracted from docs/design-system/assets/components.css: settings-layout. */
    .settings-layout {
      display: grid;
      gap: var(--space-8);
      padding-block: var(--space-8);
    }
    @media (min-width: 64rem) {
      .settings-layout {
        grid-template-columns: var(--size-settings-layout-grid-template-columns-37) minmax(0, 1fr);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly i18n = inject(TranslationService);

  protected readonly sections = computed<NavItem[]>(() => [
    { label: this.i18n.t('settings.nav.privacy'), link: '/settings/privacy' },
  ]);
}
