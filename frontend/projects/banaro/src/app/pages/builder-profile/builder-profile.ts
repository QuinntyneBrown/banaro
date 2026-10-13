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
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Router, RouterLink } from '@angular/router';
import {
  BuilderProfile,
  DIRECTORY_API,
  formatDistance,
  lastSeen,
  SessionStore,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionItem,
  DialogService,
  DescriptionList,
  EmptyState,
  ErrorPage,
  initialsOf,
  Menu,
  MenuItem,
  menuPositions,
  ProfileHeader,
  Skeleton,
  Tag,
  ToastService,
} from 'components';
import { Subscription, timer } from 'rxjs';
import { BlockBuilderData, BlockBuilderDialog } from '../../dialogs/block-builder/block-builder';
import { SeoService } from '../../shared/seo.service';

type State = 'loading' | 'ready' | 'not-found' | 'error';
const TILES = ['sage', 'clay', 'fjord', 'oat'] as const;

function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * `/builders/{id}`: one builder's profile (L2-011). Only the fields the API sends are shown; a
 * missing or hidden profile is the not-found page with a 404 status.
 */
@Component({
  selector: 'bn-builder-profile-page',
  imports: [
    Breadcrumb,
    Button,
    CdkMenuTrigger,
    DescriptionItem,
    DescriptionList,
    EmptyState,
    ErrorPage,
    Menu,
    MenuItem,
    ProfileHeader,
    RouterLink,
    Skeleton,
    Tag,
    TranslatePipe,
  ],
  templateUrl: './builder-profile.html',
  styleUrl: './builder-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderProfilePage {
  private readonly api = inject(DIRECTORY_API);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly session = inject(SessionStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly response = inject(RESPONSE_INIT, { optional: true });
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly morePositions = menuPositions('end');

  /** The builder's public id, from the route. */
  readonly id = input.required<string>();

  protected readonly state = signal<State>('loading');
  protected readonly slow = signal(false);
  protected readonly profile = signal<BuilderProfile | null>(null);
  protected readonly signedIn = computed(() => !!this.session.member());

  protected readonly firstName = computed(() => (this.profile()?.name ?? '').split(/\s+/)[0]);
  protected readonly crumbs = computed<BreadcrumbItem[]>(() => [
    { label: this.i18n.t('directory.profile.crumb'), link: '/builders' },
    { label: this.profile()?.name ?? this.i18n.t('directory.profile.builder') },
  ]);
  protected readonly role = computed(() => {
    const p = this.profile();
    if (!p) return null;
    if (p.headline) return p.headline;
    return p.role ? this.i18n.t(`profiles.roles.${camel(p.role)}`) : null;
  });
  protected readonly distance = computed(() => {
    const km = this.profile()?.distanceKm;
    if (km === undefined || km === null) return null;
    // A distance that rounds to nothing still says roughly how near (D-046).
    return km < 0.05 ? this.i18n.t('directory.profile.under5') : formatDistance(km);
  });
  protected readonly place = computed(() => {
    const p = this.profile();
    const hood = p?.neighbourhood?.name;
    if (!hood) return null;
    const distance = this.distance();
    return distance ? this.i18n.t('directory.card.away', { place: hood, distance }) : hood;
  });
  protected readonly presence = computed(() => {
    const p = this.profile();
    if (!p || p.online === undefined) return null;
    if (p.online) return { online: true, text: this.i18n.t('directory.presence.online') };
    if (!p.lastSeenAt) return null;
    const seen = lastSeen(p.lastSeenAt);
    const text =
      'count' in seen
        ? this.i18n.t(`directory.presence.${seen.unit}`, { count: seen.count })
        : this.i18n.t(`directory.presence.${seen.unit}`);
    return { online: false, text };
  });
  protected readonly reasons = computed(() => {
    const p = this.profile();
    if (!p?.match) return '';
    return p.match.reasons
      .map((r) =>
        r.code === 'nearby'
          ? this.i18n.t('directory.profile.reasons.nearby', {
              name: this.firstName(),
              distance: this.distance() ?? formatDistance(r.km),
              from: p.distanceFrom ?? '',
            })
          : this.i18n.t('directory.profile.reasons.recentlyActive', { name: this.firstName() }),
      )
      .join(' ');
  });
  protected readonly openTo = computed(() =>
    (this.profile()?.openTo ?? [])
      .map((o) => this.i18n.t(`directory.openTo.${camel(o)}`))
      .join(', '),
  );
  protected readonly memberSince = computed(() => {
    const since = this.profile()?.memberSince;
    return since
      ? new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' }).format(
          new Date(`${since}T12:00:00`),
        )
      : null;
  });
  protected readonly tile = computed(() => {
    let hash = 0;
    for (const char of this.profile()?.id ?? '') hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return TILES[hash % TILES.length];
  });

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

  protected period(started: string, ended: string | null): string {
    const format = new Intl.DateTimeFormat('en-CA', { month: 'short', year: 'numeric' });
    const from = format.format(new Date(`${started}T12:00:00`));
    const to = ended
      ? format.format(new Date(`${ended}T12:00:00`))
      : this.i18n.t('directory.profile.now');
    return `${from} – ${to}`;
  }

  /** Blocks from "More": on success the profile is gone for both, so the member returns to the directory (D-049). */
  protected block(profile: BuilderProfile): void {
    const firstName = this.firstName();
    const ref = this.dialogs.open<BlockBuilderDialog, BlockBuilderData, boolean>(
      BlockBuilderDialog,
      {
        data: { builderId: profile.id, name: profile.name, firstName },
        size: 'sm',
        described: true,
        autoFocus: '.dialog__footer [variant=quiet]',
      },
    );
    ref.closed.subscribe((blocked) => {
      if (!blocked) return;
      this.toasts.show({
        variant: 'success',
        title: this.i18n.t('trustAndSafety.block.done.title', { name: firstName }),
        body: this.i18n.t('trustAndSafety.block.done.body'),
      });
      void this.router.navigateByUrl('/builders');
    });
  }

  protected retry(): void {
    this.load(this.id());
  }

  private load(id: string): void {
    this.state.set('loading');
    this.slow.set(false);
    const skeletons = timer(300)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.slow.set(true));
    this.request?.unsubscribe();
    this.request = this.api
      .getBuilder(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          skeletons.unsubscribe();
          this.profile.set(profile);
          this.state.set('ready');
          this.seo.set({
            title: this.i18n.t('directory.profile.meta.title', { name: profile.name }),
            path: `/builders/${profile.id}`,
            noindex: true,
          });
        },
        error: (error: unknown) => {
          skeletons.unsubscribe();
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.state.set('not-found');
            if (this.response) this.response.status = 404;
            this.seo.set({
              title: this.i18n.t('directory.profile.notFound.meta'),
              path: `/builders/${id}`,
              noindex: true,
            });
          } else {
            this.state.set('error');
          }
        },
      });
  }
}
