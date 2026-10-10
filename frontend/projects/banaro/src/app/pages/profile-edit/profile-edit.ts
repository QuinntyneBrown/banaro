import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ExperienceEntry,
  formatNumber,
  OpenTo,
  OwnProfile,
  PROFILES_API,
  ProfileLink,
  SessionStore,
  SkillEntry,
  SkillRef,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Alert,
  Button,
  Chip,
  ChipList,
  Choice,
  Choices,
  EmptyState,
  Field,
  fieldDescriptionId,
  FieldRow,
  Form,
  FormActions,
  FormError,
  FormSection,
  FormSummary,
  Input,
  InputGroup,
  PageHeader,
  Skeleton,
  Textarea,
  ToastService,
} from 'components';
import { SeoService } from '../../shared/seo.service';

type State = 'loading' | 'error' | 'ready';
const OPEN_TO: OpenTo[] = ['co_founding', 'advising', 'contributing'];
const BIO_MAX = 500;
const SKILLS_MAX = 12;

/** Catalogue keys are camel case: `co_founding` → `coFounding`. */
function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/** `/profile/edit`: the member's own profile, saved whole (L2-007). */
@Component({
  selector: 'bn-profile-edit-page',
  imports: [
    Alert,
    Button,
    Chip,
    ChipList,
    Choice,
    Choices,
    EmptyState,
    Field,
    FieldRow,
    Form,
    FormActions,
    FormSection,
    FormSummary,
    FormsModule,
    Input,
    InputGroup,
    PageHeader,
    RouterLink,
    Skeleton,
    Textarea,
    TranslatePipe,
  ],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEditPage {
  private readonly api = inject(PROFILES_API);
  private readonly session = inject(SessionStore);
  private readonly i18n = inject(TranslationService);
  private readonly toasts = inject(ToastService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected readonly describedBy = fieldDescriptionId;
  protected readonly openToChoices = OPEN_TO;
  protected readonly bioMax = BIO_MAX;

  protected readonly state = signal<State>('loading');
  protected readonly profile = signal<OwnProfile | null>(null);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly saveFailed = signal(false);
  protected readonly errors = signal<Record<string, string>>({});

  protected readonly name = signal('');
  protected readonly headline = signal('');
  protected readonly neighbourhoodId = signal<number | null>(null);
  protected readonly bio = signal('');
  protected readonly skills = signal<SkillRef[]>([]);
  protected readonly newSkill = signal('');
  protected readonly experience = signal<ExperienceEntry[]>([]);
  protected readonly links = signal<ProfileLink[]>([]);
  protected readonly openTo = signal<Set<OpenTo>>(new Set());
  protected readonly lookingFor = signal('');
  protected readonly building = signal('');

  protected readonly profileLink = computed(() => {
    const id = this.profile()?.id ?? this.session.member()?.builderId;
    return id ? ['/builders', id] : ['/dashboard'];
  });
  protected readonly bioCounter = computed(
    () => `${formatNumber(this.bio().length)} / ${formatNumber(BIO_MAX)}`,
  );
  protected readonly bioDescribedBy = computed(
    () => `${fieldDescriptionId('bio', this.errors()['bio'], true)} bio-count`,
  );
  protected readonly summaryErrors = computed<FormError[]>(() =>
    Object.entries(this.errors()).map(([controlId, message]) => ({ controlId, message })),
  );

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('profiles.edit.meta.title'),
      path: '/profile/edit',
      noindex: true,
    });
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.api.getOwnProfile().subscribe({
      next: (profile) => {
        this.fill(profile);
        this.state.set('ready');
      },
      error: () => this.state.set('error'),
    });
  }

  protected openToLabel(choice: OpenTo, part: 'title' | 'text'): string {
    return this.i18n.t(`profiles.edit.openTo.${camel(choice)}.${part}`);
  }

  protected toggleOpenTo(choice: OpenTo, checked: boolean): void {
    this.openTo.update((set) => {
      const next = new Set(set);
      if (checked) next.add(choice);
      else next.delete(choice);
      return next;
    });
  }

  /** Adds the typed skill; repeats, however written, are ignored. */
  protected addSkill(): void {
    const name = this.newSkill().trim();
    if (!name) return;
    const known = this.skills().some((s) => s.name.toLowerCase() === name.toLowerCase());
    if (!known) this.skills.update((list) => [...list, { id: 0, name }]);
    this.newSkill.set('');
  }

  protected removeSkill(index: number): void {
    this.skills.update((list) => list.filter((_s, i) => i !== index));
  }

  protected addExperience(): void {
    this.experience.update((list) => [
      ...list,
      { title: '', organization: null, startedOn: '', endedOn: null },
    ]);
  }

  protected updateExperience(index: number, change: Partial<ExperienceEntry>): void {
    this.experience.update((list) => list.map((e, i) => (i === index ? { ...e, ...change } : e)));
  }

  protected removeExperience(index: number): void {
    this.experience.update((list) => list.filter((_e, i) => i !== index));
  }

  protected addLink(): void {
    this.links.update((list) => [...list, { label: '', url: '' }]);
  }

  protected updateLink(index: number, change: Partial<ProfileLink>): void {
    this.links.update((list) => list.map((l, i) => (i === index ? { ...l, ...change } : l)));
  }

  protected removeLink(index: number): void {
    this.links.update((list) => list.filter((_l, i) => i !== index));
  }

  protected save(): void {
    if (this.saving()) return;
    this.saved.set(false);
    this.saveFailed.set(false);
    const errors = this.clientErrors();
    if (Object.keys(errors).length) {
      this.showInvalid(errors);
      return;
    }
    this.errors.set({});
    this.saving.set(true);
    this.api
      .updateOwnProfile({
        name: this.name().trim(),
        headline: this.headline().trim() || null,
        neighbourhoodId: this.neighbourhoodId(),
        bio: this.bio().trim() || null,
        skills: this.skills().map((s): SkillEntry => ({ name: s.name })),
        experience: this.experience().map((e) => ({
          ...e,
          organization: e.organization?.trim() || null,
          endedOn: e.endedOn || null,
        })),
        links: this.links(),
        openTo: [...this.openTo()],
        lookingFor: this.lookingFor().trim() || null,
        building: this.building().trim() || null,
      })
      .subscribe({
        next: (profile) => {
          this.saving.set(false);
          this.fill(profile);
          this.saved.set(true);
          const member = this.session.member();
          if (member) this.session.member.set({ ...member, name: profile.name });
          this.toasts.show({ variant: 'success', title: this.i18n.t('profiles.edit.saved.title') });
          afterNextRender(() => this.document.getElementById('profile-saved')?.focus(), {
            injector: this.injector,
          });
        },
        error: (error: unknown) => {
          this.saving.set(false);
          const failure = toApiError(error);
          if (failure.kind === 'validation') {
            this.showInvalid(this.serverErrors(failure.fields));
            return;
          }
          this.saveFailed.set(true);
        },
      });
  }

  private fill(profile: OwnProfile): void {
    this.profile.set(profile);
    this.name.set(profile.name);
    this.headline.set(profile.headline ?? '');
    this.neighbourhoodId.set(profile.neighbourhoodId);
    this.bio.set(profile.bio ?? '');
    this.skills.set(profile.skills);
    this.experience.set(profile.experience);
    this.links.set(profile.links);
    this.openTo.set(new Set(profile.openTo));
    this.lookingFor.set(profile.lookingFor ?? '');
    this.building.set(profile.building ?? '');
  }

  /** The same limits as the API, so most mistakes show before a request (L2-007 criterion 3). */
  private clientErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!this.name().trim()) errors['name'] = this.i18n.t('profiles.errors.nameRequired');
    if (this.bio().length > BIO_MAX)
      errors['bio'] = this.i18n.t('profiles.errors.bioMax', { count: this.bio().length });
    if (this.skills().length > SKILLS_MAX)
      errors['skill-add'] = this.i18n.t('profiles.errors.skillsMax');
    if (!this.openTo().size) errors['open-to'] = this.i18n.t('profiles.errors.openToRequired');
    return errors;
  }

  /** Maps `links.0.url` to the control `link-0-url`, and so on. */
  private serverErrors(fields: Record<string, string>): Record<string, string> {
    const ids: Record<string, string> = {
      name: 'name',
      headline: 'headline',
      neighbourhood_id: 'hood',
      bio: 'bio',
      skills: 'skill-add',
      open_to: 'open-to',
      looking_for: 'looking',
      building: 'building',
    };
    const errors: Record<string, string> = {};
    for (const [field, message] of Object.entries(fields)) {
      const [root, index, part] = field.split('.');
      const id =
        root === 'experience' && index !== undefined
          ? `experience-${index}-${(part ?? 'title').replace('_', '-')}`
          : root === 'links' && index !== undefined
            ? `link-${index}-${part ?? 'url'}`
            : (ids[root] ?? root);
      errors[id] ??= message;
    }
    return errors;
  }

  private showInvalid(errors: Record<string, string>): void {
    this.errors.set(errors);
    afterNextRender(() => this.document.getElementById('error-summary')?.focus(), {
      injector: this.injector,
    });
  }
}
