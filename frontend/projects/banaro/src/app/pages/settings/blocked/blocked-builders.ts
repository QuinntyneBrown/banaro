import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BlockedBuilder, TRUST_AND_SAFETY_API, TranslatePipe, TranslationService } from 'api';
import { Avatar, Button, EmptyState, initialsOf, Skeleton, ToastService } from 'components';
import { SeoService } from '../../../shared/seo.service';

/**
 * Settings › Blocked builders: everyone the member has blocked, with "Unblock" (L2-032 criterion 3,
 * D-049). A row leaves the list only once the API confirms.
 */
@Component({
  selector: 'bn-blocked-builders',
  imports: [Avatar, Button, EmptyState, Skeleton, TranslatePipe],
  template: `
    <section aria-labelledby="blocked-title">
      <h2 class="section__title" id="blocked-title">{{ 'settings.blocked.title' | t }}</h2>
      <p class="muted">{{ 'settings.blocked.sub' | t }}</p>
      @switch (state()) {
        @case ('loading') {
          <div class="blocked__body" aria-busy="true">
            <p class="vh" role="status">{{ 'settings.loading' | t }}</p>
            <span bn-skeleton shape="block"></span>
          </div>
        }
        @case ('error') {
          <div class="blocked__body">
            <bn-empty-state tone="error" [heading]="'settings.loadFailed.title' | t">
              {{ 'settings.loadFailed.body' | t }}
              <button slot="actions" bn-button variant="primary" type="button" (click)="load()">
                {{ 'settings.tryAgain' | t }}
              </button>
            </bn-empty-state>
          </div>
        }
        @default {
          <div class="blocked__body">
            @if (blocked().length) {
              <ul class="rows" [attr.aria-label]="'settings.blocked.title' | t">
                @for (row of blocked(); track row.builderId) {
                  <li>
                    <bn-avatar
                      [name]="row.name"
                      [src]="row.photoUrl"
                      [initials]="initials(row.name)"
                      decorative
                    />
                    <div class="rows__main">
                      <p class="rows__title">{{ row.name }}</p>
                      <p class="rows__meta">
                        {{ 'settings.blocked.since' | t: { date: date(row.blockedAt) } }}
                      </p>
                    </div>
                    <button
                      bn-button
                      variant="quiet"
                      size="sm"
                      type="button"
                      [busy]="unblocking() === row.builderId"
                      [disabled]="unblocking() === row.builderId"
                      [attr.aria-label]="'settings.blocked.unblockNamed' | t: { name: row.name }"
                      (click)="unblock(row)"
                    >
                      {{ 'settings.blocked.unblock' | t }}
                    </button>
                  </li>
                }
              </ul>
            } @else {
              <bn-empty-state [heading]="'settings.blocked.none.title' | t">
                {{ 'settings.blocked.none.body' | t }}
              </bn-empty-state>
            }
          </div>
        }
      }
    </section>
  `,
  styles: `
    .section__title {
      margin: 0;
      font: var(--text-h3);
      font-size: var(--font-size-2xl);
    }
    .muted {
      margin: var(--space-2) 0 0;
      color: var(--color-fg-muted);
    }
    .blocked__body {
      margin-top: var(--space-6);
    }
    .rows {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .rows > li {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding-block: var(--space-4);
      border-bottom: var(--border-width-hairline) solid var(--color-border-default);
    }
    .rows__main {
      flex: 1;
      min-width: 0;
    }
    .rows__title {
      margin: 0;
      font: var(--text-h4);
      overflow-wrap: anywhere;
    }
    .rows__meta {
      margin: 0;
      font: var(--text-body-sm);
      color: var(--color-fg-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockedBuildersSection {
  private readonly api = inject(TRUST_AND_SAFETY_API);
  private readonly i18n = inject(TranslationService);
  private readonly toasts = inject(ToastService);

  protected readonly state = signal<'loading' | 'error' | 'ready'>('loading');
  protected readonly blocked = signal<BlockedBuilder[]>([]);
  protected readonly unblocking = signal<string | null>(null);

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('settings.blocked.meta.title'),
      path: '/settings/blocked',
      noindex: true,
    });
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.api.listBlocked().subscribe({
      next: (rows) => {
        this.blocked.set(rows);
        this.state.set('ready');
      },
      error: () => this.state.set('error'),
    });
  }

  protected unblock(row: BlockedBuilder): void {
    const firstName = row.name.split(/\s+/)[0];
    this.unblocking.set(row.builderId);
    this.api.unblock(row.builderId).subscribe({
      next: () => {
        this.unblocking.set(null);
        this.blocked.update((rows) => rows.filter((r) => r.builderId !== row.builderId));
        this.toasts.show({
          variant: 'success',
          title: this.i18n.t('settings.blocked.done', { name: firstName }),
        });
      },
      error: () => {
        this.unblocking.set(null);
        this.toasts.show({
          variant: 'danger',
          title: this.i18n.t('settings.blocked.failed', { name: firstName }),
          action: { label: this.i18n.t('settings.tryAgain'), run: () => this.unblock(row) },
        });
      },
    });
  }

  protected initials(name: string): string {
    return initialsOf(name);
  }

  protected date(iso: string): string {
    return new Intl.DateTimeFormat('en-CA', { dateStyle: 'long' }).format(new Date(iso));
  }
}
