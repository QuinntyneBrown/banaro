import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  formatNumber,
  LOOKING_FOR_ROLES,
  ProjectCard as ProjectSummary,
  ProjectPage,
  PROJECT_STAGES,
  PROJECTS_API,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Button,
  EmptyState,
  Input,
  PageHeader,
  Pagination,
  ProjectCard,
  ProjectFact,
  ProjectTone,
  SearchBox,
  SearchFilterToolbar,
  Select,
  SkeletonCard,
  ToolbarFilter,
} from 'components';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { decodeProjectsUrl, ProjectsUrl, projectsListKey } from '../../shared/project-query-codec';
import { SeoService } from '../../shared/seo.service';

const TONES: readonly ProjectTone[] = ['sage', 'clay', 'fjord', 'oat'];
const PER_PAGE = 12;

/** Catalogue keys are camel case: `technical_co_founder` becomes `technicalCoFounder`. */
function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * `/projects`: the project showcase for members and visitors (L2-015). The search and the stage and
 * "looking for" filters live in the URL; "Show more" appends the next page and records it there, so
 * a reload shows the same list.
 */
@Component({
  selector: 'bn-projects-page',
  imports: [
    Button,
    EmptyState,
    Input,
    PageHeader,
    Pagination,
    ProjectCard,
    RouterLink,
    SearchBox,
    SearchFilterToolbar,
    Select,
    SkeletonCard,
    TranslatePipe,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage {
  private readonly api = inject(PROJECTS_API);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly stages = PROJECT_STAGES;
  protected readonly roles = LOOKING_FOR_ROLES;
  protected readonly url = toSignal(this.route.queryParamMap.pipe(map(decodeProjectsUrl)), {
    requireSync: true,
  });

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  /** Skeletons wait about 300 ms, so a quick answer never flashes them. */
  protected readonly slow = signal(false);
  protected readonly items = signal<ProjectSummary[]>([]);
  protected readonly total = signal(0);
  protected readonly loadedPage = signal(0);
  protected readonly lastPage = signal(1);
  protected readonly loadingMore = signal(false);
  protected readonly skeletons = Array.from({ length: PER_PAGE }, (_, i) => i);

  protected readonly activeFilters = computed<ToolbarFilter[]>(() => {
    const { stage, lookingFor } = this.url();
    const filter = (id: string, label: string): ToolbarFilter => ({
      id,
      label,
      removeLabel: this.i18n.t('projects.list.filters.remove', { label }),
    });
    return [
      ...(stage
        ? [
            filter(
              'stage',
              this.i18n.t('projects.list.filters.stageChip', { stage: this.stageLabel(stage) }),
            ),
          ]
        : []),
      ...(lookingFor
        ? [
            filter(
              'looking_for',
              this.i18n.t('projects.list.filters.lookingForChip', {
                role: this.roleLabel(lookingFor),
              }),
            ),
          ]
        : []),
    ];
  });
  protected readonly range = computed(() =>
    this.items().length ? `1–${formatNumber(this.items().length)}` : '0',
  );
  protected readonly totalText = computed(() => formatNumber(this.total()));
  /** What the person asked for, in words, after "0 projects match". */
  protected readonly terms = computed(() => {
    const { q, stage, lookingFor } = this.url();
    return [
      ...(q ? [`“${q}”`] : []),
      ...(stage ? [this.stageLabel(stage)] : []),
      ...(lookingFor
        ? [
            this.i18n.t('projects.list.filters.lookingForTerm', {
              role: this.roleLabel(lookingFor),
            }),
          ]
        : []),
    ].join(', ');
  });

  private readonly typing = new Subject<string>();
  private readonly retry = new Subject<void>();
  private listKey = '';
  private request?: { unsubscribe(): void };

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('projects.list.meta.title'),
      description: this.i18n.t('projects.list.meta.description'),
      path: '/projects',
    });

    this.typing
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => this.navigate({ q: q.trim() || null, page: null }));
    this.retry.pipe(takeUntilDestroyed()).subscribe(() => this.reload(this.url(), true));
    // Reload whenever the search, a filter or a page not yet on screen changes; a page this list
    // reached by "Show more" is already here.
    this.route.queryParamMap
      .pipe(
        map(decodeProjectsUrl),
        distinctUntilChanged(
          (a, b) => projectsListKey(a) === projectsListKey(b) && a.page === b.page,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((url) => this.reload(url, false));
  }

  protected typed(q: string): void {
    this.typing.next(q);
  }

  protected searched(q: string): void {
    this.navigate({ q: q || null, page: null });
  }

  protected chooseStage(stage: string): void {
    this.navigate({ stage: stage || null, page: null });
  }

  protected chooseRole(role: string): void {
    this.navigate({ looking_for: role || null, page: null });
  }

  protected removeFilter(id: string): void {
    this.navigate({ [id]: null, page: null });
  }

  protected clearFilters(): void {
    this.navigate({ stage: null, looking_for: null, page: null });
  }

  protected tryAgain(): void {
    this.retry.next();
  }

  protected more(): void {
    const next = this.loadedPage() + 1;
    this.loadingMore.set(true);
    this.api
      .browse(this.query(this.url(), next))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.items.update((items) => [...items, ...result.items]);
          this.accept(result);
          this.loadingMore.set(false);
          this.navigate({ page: result.page }, true);
        },
        error: () => {
          this.loadingMore.set(false);
          this.state.set('error');
        },
      });
  }

  protected stageLabel(stage: string): string {
    return this.i18n.t(`projects.stages.${stage}`);
  }

  protected roleLabel(role: string): string {
    return this.i18n.t(`projects.roles.${camel(role)}`);
  }

  protected bylineOf(project: ProjectSummary): string {
    return this.i18n.t('projects.list.card.by', { owner: project.owner.name });
  }

  protected factsOf(project: ProjectSummary): ProjectFact[] {
    const roles = project.lookingFor.map((role) => this.roleLabel(role)).join(', ');
    return [
      { term: this.i18n.t('projects.list.card.stage'), value: this.stageLabel(project.stage) },
      {
        term: this.i18n.t('projects.list.card.lookingFor'),
        value: roles || this.i18n.t('projects.list.card.noRole'),
      },
      {
        term: this.i18n.t('projects.list.card.feedback'),
        value: this.i18n.t('projects.list.card.comments', { count: project.feedbackCount }),
      },
    ];
  }

  /** The same project keeps the same mark colour everywhere. */
  protected toneOf(id: string): ProjectTone {
    let hash = 0;
    for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return TONES[hash % TONES.length];
  }

  protected pagerStatus(): string {
    return this.i18n.t('projects.list.pager.status', {
      shown: formatNumber(this.items().length),
      total: this.total(),
    });
  }

  private query(url: ProjectsUrl, page: number) {
    return {
      q: url.q,
      stage: url.stage ? [url.stage] : [],
      lookingFor: url.lookingFor ? [url.lookingFor] : [],
      page,
    };
  }

  private reload(url: ProjectsUrl, force: boolean): void {
    if (
      !force &&
      url.page === this.loadedPage() &&
      this.state() === 'ready' &&
      this.listKey === projectsListKey(url)
    ) {
      return;
    }
    this.listKey = projectsListKey(url);
    this.state.set('loading');
    this.slow.set(false);
    const done = new Subject<void>();
    timer(300)
      .pipe(takeUntil(done), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.slow.set(true));
    this.request?.unsubscribe();
    this.request = this.loadThrough(url)
      .pipe(
        tap(() => done.next()),
        catchError(() => {
          done.next();
          this.state.set('error');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (!result) return;
        this.items.set(result.items);
        this.accept(result);
        this.state.set('ready');
        // A page past the end was served as the last page; the URL says so too.
        if (result.page !== url.page) this.navigate({ page: result.page }, true);
      });
  }

  /** Loads the requested page and every page before it, as one list. */
  private loadThrough(url: ProjectsUrl): Observable<ProjectPage> {
    return this.api.browse(this.query(url, url.page)).pipe(
      switchMap((last) => {
        if (last.page <= 1) return of(last);
        const earlier = Array.from({ length: last.page - 1 }, (_, i) =>
          this.api.browse(this.query(url, i + 1)),
        );
        return forkJoin(earlier).pipe(
          map((pages) => ({ ...last, items: [...pages.flatMap((p) => p.items), ...last.items] })),
        );
      }),
    );
  }

  private accept(result: ProjectPage): void {
    this.total.set(result.total);
    this.loadedPage.set(result.page);
    this.lastPage.set(result.lastPage);
  }

  private navigate(params: Record<string, string | number | null>, replace = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: replace,
    });
  }
}
