import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  RESPONSE_INIT,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  formatLongDate,
  formatNumber,
  Project,
  PROJECTS_API,
  SessionStore,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  AsideCard,
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  EmptyState,
  ErrorPage,
  initialsOf,
  Skeleton,
} from 'components';
import { Subscription, timer } from 'rxjs';
import { SeoService } from '../../shared/seo.service';

type State = 'loading' | 'ready' | 'not-found' | 'error';
const TONES = ['sage', 'clay', 'fjord', 'oat'] as const;

/** Catalogue keys are camel case: `technical_co_founder` becomes `technicalCoFounder`. */
function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * `/projects/{id}`: one project's page (L2-013). Anyone may read it; the owner sees it without the
 * actions meant for other people. A missing project is the not-found page with a 404 status.
 */
@Component({
  selector: 'bn-project-detail-page',
  imports: [
    AsideCard,
    Avatar,
    Breadcrumb,
    Button,
    EmptyState,
    ErrorPage,
    RouterLink,
    Skeleton,
    TranslatePipe,
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailPage {
  private readonly api = inject(PROJECTS_API);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly session = inject(SessionStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly response = inject(RESPONSE_INIT, { optional: true });

  /** The project's public id, from the route. */
  readonly id = input.required<string>();

  protected readonly state = signal<State>('loading');
  protected readonly slow = signal(false);
  protected readonly project = signal<Project | null>(null);
  protected readonly signedIn = computed(() => !!this.session.member());

  protected readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: this.i18n.t('projects.crumb'), link: '/projects' },
    { label: this.project()?.name ?? this.i18n.t('projects.detail.loading') },
  ]);
  protected readonly stage = computed(() => {
    const stage = this.project()?.stage;
    return stage ? this.i18n.t(`projects.stages.${stage}`) : '';
  });
  protected readonly lookingFor = computed(() =>
    (this.project()?.lookingFor ?? [])
      .map((role) => this.i18n.t(`projects.roles.${camel(role)}`))
      .join(', '),
  );
  protected readonly updated = computed(() => {
    const at = this.project()?.lastActivityAt;
    return at ? formatLongDate(at.slice(0, 10)) : null;
  });
  /** The description as paragraphs, so markup in it is shown as text (L2-045). */
  protected readonly paragraphs = computed(() =>
    (this.project()?.description ?? '')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean),
  );
  protected readonly host = computed(() => {
    const link = this.project()?.link;
    if (!link) return null;
    try {
      return new URL(link).host;
    } catch {
      return link;
    }
  });
  protected readonly tone = computed(() => this.toneOf(this.project()?.id ?? ''));
  protected readonly mark = computed(
    () => [...(this.project()?.name ?? '')][0]?.toLocaleUpperCase('en-CA') ?? '',
  );
  protected readonly commentCount = computed(() =>
    formatNumber(this.project()?.feedbackCount ?? 0),
  );

  private request?: Subscription;

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  protected initials(name: string): string {
    return initialsOf(name);
  }

  protected tileOf(id: string): (typeof TONES)[number] {
    return this.toneOf(id);
  }

  protected retry(): void {
    this.load(this.id());
  }

  private toneOf(id: string): (typeof TONES)[number] {
    let hash = 0;
    for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return TONES[hash % TONES.length];
  }

  private load(id: string): void {
    this.state.set('loading');
    this.slow.set(false);
    const skeletons = timer(300)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.slow.set(true));
    this.request?.unsubscribe();
    this.request = this.api
      .get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (project) => {
          skeletons.unsubscribe();
          this.project.set(project);
          this.state.set('ready');
          this.seo.set({
            title: this.i18n.t('projects.detail.meta.title', { name: project.name }),
            description: project.summary,
            path: `/projects/${project.id}`,
          });
        },
        error: (error: unknown) => {
          skeletons.unsubscribe();
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.state.set('not-found');
            if (this.response) this.response.status = 404;
            this.seo.set({
              title: this.i18n.t('projects.detail.meta.notFound'),
              path: `/projects/${id}`,
              noindex: true,
            });
          } else {
            this.state.set('error');
          }
        },
      });
  }
}
