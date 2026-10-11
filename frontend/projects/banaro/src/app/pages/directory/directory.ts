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
  DirectoryFacets,
  DirectoryFilters,
  DirectoryResultPage,
  DirectorySort,
  DISTANCE_OPTIONS,
  DistanceOption,
  formatDistance,
  formatNumber,
  lastSeen,
  MEMBER_SORTS,
  NO_FILTERS,
  SessionStore,
  TranslatePipe,
  TranslationService,
  VISITOR_SORTS,
} from 'api';
import {
  ActiveFilters,
  Button,
  Card,
  DialogService,
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
import { decodeFilters, encodeFilters, hasFilters } from '../../shared/directory-query-codec';
import { SeoService } from '../../shared/seo.service';
import { distanceLabel, DirectoryFiltersForm } from './directory-filters';
import { FilterSheet, FilterSheetData } from './filter-sheet';

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
  filters: DirectoryFilters;
}

/** What makes a list: everything but the page, which "Show more" grows. */
function listKey(url: DirectoryUrl): string {
  return JSON.stringify([url.q, url.sort, encodeFilters(url.filters)]);
}

/**
 * `/builders`: the builder directory for members and visitors (L2-009), with facet filters for
 * members (L2-010). The query and filters live in the URL; "Show more" appends the next page and
 * records it there, so a reload shows the same list.
 */
@Component({
  selector: 'bn-directory-page',
  imports: [
    ActiveFilters,
    Button,
    Card,
    DirectoryFiltersForm,
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
  private readonly dialogs = inject(DialogService);

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
  /** The last option counts; kept while a new page loads. */
  protected readonly facets = signal<DirectoryFacets | null>(null);
  protected readonly filtered = computed(() => hasFilters(this.url().filters));
  protected readonly activeChips = computed(() => this.chipsFor(this.url().filters));
  /** The next wider distance to suggest when nothing matches (D-044). */
  protected readonly wider = computed<DistanceOption | null>(() => {
    const current = this.url().filters.distance ?? 40;
    const at = DISTANCE_OPTIONS.indexOf(current);
    return at >= 0 && at < DISTANCE_OPTIONS.length - 1 ? DISTANCE_OPTIONS[at + 1] : null;
  });
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
        distinctUntilChanged((a, b) => listKey(a) === listKey(b) && a.page === b.page),
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

  protected setFilters(filters: DirectoryFilters): void {
    this.navigate({ ...encodeFilters(filters), page: null });
  }

  protected clearFilters(): void {
    this.setFilters(NO_FILTERS);
  }

  protected removeFilter(key: string): void {
    const [group, value] = key.split(':') as [keyof DirectoryFilters, string];
    const filters = this.url().filters;
    if (group === 'distance') {
      this.setFilters({ ...filters, distance: null });
      return;
    }
    this.setFilters({
      ...filters,
      [group]: (filters[group] as string[]).filter((v) => v !== value),
    });
  }

  protected widen(distance: DistanceOption): void {
    this.setFilters({ ...this.url().filters, distance });
  }

  protected widenLabel(distance: DistanceOption): string {
    return distance === 'any'
      ? this.i18n.t('directory.noResults.anywhere')
      : this.i18n.t('directory.noResults.within', { km: distance });
  }

  /** Below 992 px the filters open as a bottom sheet; they apply on "Apply" (L2-010 criterion 6). */
  protected openFilters(): void {
    const ref = this.dialogs.open<FilterSheet, FilterSheetData, DirectoryFilters>(FilterSheet, {
      data: { facets: this.facets(), filters: this.url().filters },
      sheetBelow: 'LG',
      autoFocus: 'first-heading',
    });
    ref.closed.subscribe((filters) => {
      if (filters) this.setFilters(filters);
    });
  }

  protected tryAgain(): void {
    this.retry.next();
  }

  protected more(): void {
    const { q, sort, filters } = this.url();
    const next = this.loadedPage() + 1;
    this.loadingMore.set(true);
    this.api
      .searchBuilders({ q, sort, page: next, perPage: PER_PAGE, filters })
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
      // Filters are for members (D-044); a visitor's link ignores them.
      filters: this.member() ? decodeFilters(params) : NO_FILTERS,
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
    this.listKey = listKey(url);
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
    return this.listKey === listKey(url);
  }

  /** Loads the requested page and every page before it, as one list. */
  private loadThrough(url: DirectoryUrl): Observable<DirectoryResultPage> {
    const query = { q: url.q, sort: url.sort, perPage: PER_PAGE, filters: url.filters };
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
    if (result.facets) this.facets.set(result.facets);
    this.total.set(result.total);
    this.loadedPage.set(result.page);
    this.lastPage.set(result.lastPage);
  }

  /** Removable chips for the filters in force, in group order. */
  private chipsFor(
    filters: DirectoryFilters,
  ): { key: string; label: string; removeLabel: string }[] {
    const facets = this.facets();
    const chip = (key: string, label: string) => ({
      key,
      label,
      removeLabel: this.i18n.t('directory.filters.remove', { label }),
    });
    const skillName = (slug: string) => facets?.skills.find((s) => s.slug === slug)?.name ?? slug;
    const distance =
      filters.distance === null
        ? []
        : [
            chip(
              'distance:',
              filters.distance === 'any'
                ? distanceLabel(this.i18n, 'any')
                : this.i18n.t('directory.filters.distance.within', { km: filters.distance }),
            ),
          ];
    return [
      ...filters.role.map((r) =>
        chip('role:' + r, this.i18n.t('directory.filters.role.' + camel(r))),
      ),
      ...filters.openTo.map((o) =>
        chip('openTo:' + o, this.i18n.t('directory.openTo.' + camel(o))),
      ),
      ...filters.area.map((a) => chip('area:' + a, a)),
      ...filters.skills.map((k) => chip('skills:' + k, skillName(k))),
      ...distance,
    ];
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
