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
  FeedbackItem,
  formatLongDate,
  formatNumber,
  formatRelative,
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
  Comment,
  DialogService,
  EmptyState,
  ErrorPage,
  initialsOf,
  Skeleton,
  ToastService,
} from 'components';
import { Subscription, timer } from 'rxjs';
import { GiveFeedbackData, GiveFeedbackDialog } from '../../dialogs/give-feedback/give-feedback';
import { OfferToHelpData, OfferToHelpDialog } from '../../dialogs/offer-to-help/offer-to-help';
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
    Comment,
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
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);

  /** The project's public id, from the route. */
  readonly id = input.required<string>();

  protected readonly state = signal<State>('loading');
  protected readonly slow = signal(false);
  protected readonly project = signal<Project | null>(null);
  protected readonly signedIn = computed(() => !!this.session.member());
  /** A member who is not the owner can give feedback; a visitor is sent to sign in first. */
  protected readonly canGiveFeedback = computed(
    () => this.signedIn() && this.project()?.isOwn === false,
  );

  protected readonly feedback = signal<FeedbackItem[]>([]);
  protected readonly feedbackTotal = signal(0);
  protected readonly feedbackPage = signal(0);
  protected readonly feedbackState = signal<'idle' | 'loading' | 'error'>('idle');
  protected readonly earlier = computed(() =>
    Math.max(0, this.feedbackTotal() - this.feedback().length),
  );

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

  protected when(item: FeedbackItem): string {
    return formatRelative(item.createdAt, this.i18n.t('projects.detail.justNow'));
  }

  /** Opens the offer dialog; on success a toast confirms it (L2-017 criterion 1). */
  protected offerToHelp(): void {
    const project = this.project();
    if (!project) return;
    const ref = this.dialogs.open<OfferToHelpDialog, OfferToHelpData, unknown>(OfferToHelpDialog, {
      data: {
        projectId: project.id,
        projectName: project.name,
        ownerName: project.owner.name,
        roles: project.lookingFor,
      },
      size: 'sm',
      described: true,
      autoFocus: 'select',
    });
    ref.closed.subscribe((offer) => {
      if (!offer) return;
      this.toasts.show({
        variant: 'success',
        title: this.i18n.t('projects.offer.dialog.sent.title'),
        body: this.i18n.t('projects.offer.dialog.sent.body', {
          owner: project.owner.name.split(/\s+/)[0],
        }),
      });
    });
  }

  /** Opens the dialog; the new item heads the list and the count rises (L2-016 criterion 1). */
  protected giveFeedback(): void {
    const project = this.project();
    if (!project) return;
    const ref = this.dialogs.open<GiveFeedbackDialog, GiveFeedbackData, FeedbackItem | undefined>(
      GiveFeedbackDialog,
      {
        data: {
          projectId: project.id,
          projectName: project.name,
          ownerName: project.owner.name,
          commentCount: project.feedbackCount,
        },
        size: 'sm',
        described: true,
        autoFocus: 'textarea',
      },
    );
    ref.closed.subscribe((item) => {
      if (!item) return;
      this.feedback.update((items) => [item, ...items]);
      this.feedbackTotal.update((total) => total + 1);
      this.project.update((p) => (p ? { ...p, feedbackCount: p.feedbackCount + 1 } : p));
    });
  }

  /** Loads the next page of earlier comments and adds it below the ones on screen. */
  protected loadFeedback(): void {
    const project = this.project();
    if (!project || this.feedbackState() === 'loading') return;
    this.feedbackState.set('loading');
    this.api
      .feedback(project.id, this.feedbackPage() + 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.feedback.update((items) => [...items, ...page.items]);
          this.feedbackTotal.set(page.total);
          this.feedbackPage.set(page.page);
          this.feedbackState.set('idle');
        },
        error: () => this.feedbackState.set('error'),
      });
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
          this.feedback.set([]);
          this.feedbackTotal.set(project.feedbackCount);
          this.feedbackPage.set(0);
          this.feedbackState.set('idle');
          if (project.feedbackCount > 0) this.loadFeedback();
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
