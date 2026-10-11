import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LocationPrecision,
  PrivacySettings,
  ProfileVisibility,
  SETTINGS_API,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Alert,
  Button,
  Choice,
  Choices,
  EmptyState,
  Form,
  FormActions,
  FormSection,
  Skeleton,
  Switch,
  SwitchControl,
} from 'components';
import { SeoService } from '../../../shared/seo.service';

type State = 'loading' | 'error' | 'ready';
type Switches = 'emailContact' | 'showOnlineStatus' | 'listInAttendees';

/**
 * Settings › Privacy: who can see the profile, how precisely others see where the member is, and
 * three switches (L2-036). "Save changes" saves all five; the API enforces them everywhere.
 */
@Component({
  selector: 'bn-privacy-settings',
  imports: [
    Alert,
    Button,
    Choice,
    Choices,
    EmptyState,
    Form,
    FormActions,
    FormSection,
    FormsModule,
    Skeleton,
    Switch,
    SwitchControl,
    TranslatePipe,
  ],
  templateUrl: './privacy-settings.html',
  styles: `
    .section__title {
      margin: 0;
      font: var(--text-h3);
      font-size: var(--font-size-2xl);
    }
    .privacy__body {
      display: grid;
      gap: var(--space-6);
      margin-top: var(--space-6);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacySettingsSection {
  private readonly api = inject(SETTINGS_API);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected readonly visibilities: ProfileVisibility[] = ['members', 'everyone'];
  protected readonly precisions: LocationPrecision[] = ['neighbourhood', 'city'];
  protected readonly switches: Switches[] = ['emailContact', 'showOnlineStatus', 'listInAttendees'];

  protected readonly state = signal<State>('loading');
  protected readonly settings = signal<PrivacySettings | null>(null);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly failed = signal(false);

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('settings.privacy.meta.title'),
      path: '/settings/privacy',
      noindex: true,
    });
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.api.getPrivacy().subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.state.set('ready');
      },
      error: () => this.state.set('error'),
    });
  }

  protected set<K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]): void {
    this.saved.set(false);
    this.settings.update((s) => s && { ...s, [key]: value });
  }

  protected save(): void {
    const settings = this.settings();
    if (!settings || this.saving()) return;
    this.saving.set(true);
    this.saved.set(false);
    this.failed.set(false);
    this.api.updatePrivacy(settings).subscribe({
      next: (stored) => {
        this.settings.set(stored);
        this.saving.set(false);
        this.saved.set(true);
        this.focus('privacy-saved');
      },
      error: () => {
        // The choices stay as they are, ready to save again.
        this.saving.set(false);
        this.failed.set(true);
        this.focus('privacy-failed');
      },
    });
  }

  protected switchId(key: Switches): string {
    return `privacy-${key}`;
  }

  private focus(id: string): void {
    afterNextRender(() => this.document.getElementById(id)?.focus(), { injector: this.injector });
  }
}
