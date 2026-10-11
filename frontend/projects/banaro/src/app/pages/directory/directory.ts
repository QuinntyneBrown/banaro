import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import {
  BuilderCardSummary,
  DIRECTORY_API,
  DirectoryResultPage,
  DirectorySort,
  formatDistance,
  formatNumber,
  lastSeen,
  MEMBER_SORTS,
  SessionStore,
  TranslatePipe,
  TranslationService,
  VISITOR_SORTS,
} from 'api';
import {
  Button,
  Card,
  EmptyState,
  initialsOf,
  PageHeader,
  Pagination,
  SearchBox,
  SkeletonCard,
  Status,
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
  tap,
  timer,
  takeUntil,
} from 'rxjs';
import { SeoService } from '../../shared/seo.service';

const PER_PAGE = 12;
const TILES = ['sage', 'clay', 'fjord', 'oat'] as const;

/** Catalogue keys are camel case: `co_founding` → `coFounding`. */
function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

interface DirectoryUrl {
  q: string;
  sort: DirectorySort;
  page: number;
}

/**
 * `/builders`: the builder directory for members and visitors (L2-009). The query lives in the URL;
 * "Show more" appends the next page and records it there, so a reload shows the same list.
 */
@Component({
  selector: 'bn-directory-page',
  imports: [
    Button,
    Card,
    EmptyState,
    PageHeader,
    Pagination,
    RouterLink,
    SearchBox,
    SkeletonCard,
    Status,
    TranslatePipe,
  ],
  templateUrl: './directory.html',
  styleUrl: './directory.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryPage {
  private readonly api = inject(DIRECTORY_API);
  private readonly session = inject(SessionStore);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly member = computed(() => !!this.session.member()?.onboardingComplete);
  protected readonly sorts = computed(() => (this.member() ? MEMBER_SORTS : VISITOR_SORTS));
  protected readonly url = toSignal(this.route.queryParamMap.pipe(map((p) => this.read(p))), {
    requireSync: true,
  });

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  /** Skeletons wait about 300 ms, so a quick answer never flashes them (L2-009 criterion 7). */
  protected readonly slow = signal(false);
  protected readonly items = signal<BuilderCardSummary[]>([]);
  protected readonly total = signal(0);
  protected readonly loadedPage = signal(0);
  protected readonly lastPage = signal(1);
  protected readonly loadingMore = signal(false);
  protected readonly skeletons = Array.from({ length: PER_PAGE }, (_, i) => i);

  protected readonly range = computed(() => {
    const shown = this.items().length;
    return shown ? `1–${formatNumber(shown)}` : '0';
  });
  protected readonly totalText = computed(() => formatNumber(this.total()));
  protected readonly nextCount = computed(() =>
    Math.min(PER_PAGE, this.total() - this.items().length),
  );

  private readonly typing = new Subject<string>();
  private readonly retry = new Subject<void>();

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('directory.meta.title'),
      description: this.i18n.t('directory.meta.description'),
      path: '/builders',
    });

    this.typing
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((q) => this.navigate({ q: q.trim() || null, page: null }));

    this.retry.pipe(takeUntilDestroyed()).subscribe(() => this.reload(this.url(), true));
    // Reload whenever the search, the sort or a page not yet on screen changes; a page this list
    // reached by "Show more" is already here.
    this.route.queryParamMap
      .pipe(
        map((params) => this.read(params)),
        distinctUntilChanged((a, b) => a.q === b.q && a.sort === b.sort && a.page === b.page),
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

  protected sortBy(sort: string): void {
    this.navigate({ sort, page: null });
  }

  protected tryAgain(): void {
    this.retry.next();
  }

  protected more(): void {
    const { q, sort } = this.url();
    const next = this.loadedPage() + 1;
    this.loadingMore.set(true);
    this.api
      .searchBuilders({ q, sort, page: next, perPage: PER_PAGE })
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

  protected roleOf(card: BuilderCardSummary): string {
    if (card.headline) return card.headline;
    return card.role ? this.i18n.t(`profiles.roles.${camel(card.role)}`) : '';
  }

  protected placeOf(card: BuilderCardSummary): string {
    const hood = card.neighbourhood?.name ?? '';
    if (card.distanceKm === undefined || card.distanceKm === null) return hood;
    return this.i18n.t('directory.card.away', {
      place: hood,
      distance: formatDistance(card.distanceKm),
    });
  }

  protected openToOf(card: BuilderCardSummary): string {
    return (card.openTo ?? []).map((o) => this.i18n.t(`directory.openTo.${camel(o)}`)).join(', ');
  }

  protected presenceOf(card: BuilderCardSummary): string | null {
    if (card.online) return this.i18n.t('directory.presence.online');
    if (!card.lastSeenAt) return null;
    const seen = lastSeen(card.lastSeenAt);
    return 'count' in seen
      ? this.i18n.t(`directory.presence.${seen.unit}`, { count: seen.count })
      : this.i18n.t(`directory.presence.${seen.unit}`);
  }

  protected initialsOf(name: string): string {
    return initialsOf(name);
  }

  /** The same builder keeps the same tile colour everywhere. */
  protected tileOf(id: string): (typeof TILES)[number] {
    let hash = 0;
    for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return TILES[hash % TILES.length];
  }

  protected sortLabel(sort: DirectorySort): string {
    return this.i18n.t(`directory.sort.${camel(sort)}`);
  }

  protected pagerStatus(): string {
    return this.i18n.t('directory.pager.status', {
      shown: formatNumber(this.items().length),
      total: formatNumber(this.total()),
      page: formatNumber(this.loadedPage()),
      pages: formatNumber(this.lastPage()),
    });
  }

  private read(params: ParamMap): DirectoryUrl {
    const allowed = this.member() ? MEMBER_SORTS : VISITOR_SORTS;
    const sort = params.get('sort') as DirectorySort | null;
    const page = Number(params.get('page'));
    return {
      q: (params.get('q') ?? '').trim(),
      sort: sort && allowed.includes(sort) ? sort : allowed[0],
      page: Number.isInteger(page) && page > 0 ? page : 1,
    };
  }

  private reload(url: DirectoryUrl, force: boolean): void {
    if (
      !force &&
      url.page === this.loadedPage() &&
      this.state() === 'ready' &&
      this.sameList(url)
    ) {
      return;
    }
    this.listKey = `${url.q}|${url.sort}`;
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
        // A page past the end was served as the last page; the URL says so too (criterion 5).
        if (result.page !== url.page) this.navigate({ page: result.page }, true);
      });
  }

  private listKey = '';
  private request?: { unsubscribe(): void };

  private sameList(url: DirectoryUrl): boolean {
    return this.listKey === `${url.q}|${url.sort}`;
  }

  /** Loads the requested page and every page before it, as one list. */
  private loadThrough(url: DirectoryUrl): Observable<DirectoryResultPage> {
    const query = { q: url.q, sort: url.sort, perPage: PER_PAGE };
    return this.api.searchBuilders({ ...query, page: url.page }).pipe(
      switchMap((last) => {
        if (last.page <= 1) return of(last);
        const earlier = Array.from({ length: last.page - 1 }, (_, i) =>
          this.api.searchBuilders({ ...query, page: i + 1 }),
        );
        return forkJoin(earlier).pipe(
          map((pages) => ({ ...last, items: [...pages.flatMap((p) => p.items), ...last.items] })),
        );
      }),
    );
  }

  private accept(result: DirectoryResultPage): void {
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
