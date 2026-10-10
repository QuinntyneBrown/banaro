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
  BuilderRole,
  OnboardingProgress,
  OnboardingStep,
  OpenTo,
  PROFILES_API,
  SessionStore,
  SkillEntry,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  AuthCard,
  Button,
  Chip,
  ChipList,
  Choice,
  Choices,
  Field,
  fieldDescriptionId,
  FormError,
  FormSummary,
  Input,
  List,
  ListItem,
  Stepper,
  StepperStep,
  Textarea,
  ToastService,
} from 'components';
import { SeoService } from '../../shared/seo.service';

type View = OnboardingStep | 'success';
const STEPS: OnboardingStep[] = ['about', 'skills', 'goals'];
const MAX_SKILLS = 12;
const OPEN_TO: OpenTo[] = ['co_founding', 'advising', 'contributing'];

/** Catalogue keys are camel case: `product_manager` → `productManager`. */
function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/** `/welcome`: three short steps that start a builder's profile (L2-006). */
@Component({
  selector: 'bn-onboarding-page',
  imports: [
    AuthCard,
    Button,
    Chip,
    ChipList,
    Choice,
    Choices,
    Field,
    FormSummary,
    FormsModule,
    Input,
    List,
    ListItem,
    RouterLink,
    Stepper,
    Textarea,
    TranslatePipe,
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage {
  private readonly api = inject(PROFILES_API);
  private readonly session = inject(SessionStore);
  private readonly i18n = inject(TranslationService);
  private readonly toasts = inject(ToastService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected readonly describedBy = fieldDescriptionId;
  protected readonly openToChoices = OPEN_TO;

  protected readonly progress = signal<OnboardingProgress | null>(null);
  protected readonly view = signal<View>('about');
  protected readonly busy = signal(false);
  protected readonly errors = signal<Record<string, string>>({});

  // Answers, kept across steps until each is saved.
  protected readonly name = signal('');
  protected readonly neighbourhoodId = signal<number | null>(null);
  protected readonly role = signal<BuilderRole | null>(null);
  protected readonly selectedSkills = signal<number[]>([]);
  protected readonly otherSkill = signal('');
  protected readonly openTo = signal<Set<OpenTo>>(new Set());
  protected readonly building = signal('');

  protected readonly stepIndex = computed(() => {
    const view = this.view();
    return view === 'success' ? STEPS.length - 1 : STEPS.indexOf(view);
  });
  protected readonly steps = computed<StepperStep[]>(() =>
    STEPS.map((step, i) => ({
      position: this.i18n.t('profiles.onboarding.position', { n: i + 1, total: STEPS.length }),
      label: this.i18n.t(`profiles.onboarding.steps.${step}`),
    })),
  );
  protected readonly firstName = computed(() => this.name().trim().split(/\s+/)[0] ?? '');
  protected readonly summaryErrors = computed<FormError[]>(() =>
    Object.entries(this.errors()).map(([controlId, message]) => ({ controlId, message })),
  );

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('profiles.onboarding.meta.title'),
      description: this.i18n.t('profiles.onboarding.meta.description'),
      path: '/welcome',
      noindex: true,
    });
    this.api.getOnboarding().subscribe({
      next: (progress) => this.resume(progress),
      error: () => this.failed(() => this.reload()),
    });
  }

  protected roleLabel(role: BuilderRole): string {
    return this.i18n.t(`profiles.roles.${camel(role)}`);
  }

  protected openToLabel(choice: OpenTo, part: 'title' | 'text'): string {
    return this.i18n.t(`profiles.onboarding.goals.${camel(choice)}.${part}`);
  }

  protected isSkillSelected(id: number): boolean {
    return this.selectedSkills().includes(id);
  }

  protected toggleSkill(id: number, pressed: boolean): void {
    this.selectedSkills.update((ids) => (pressed ? [...ids, id] : ids.filter((i) => i !== id)));
  }

  protected toggleOpenTo(choice: OpenTo, checked: boolean): void {
    this.openTo.update((set) => {
      const next = new Set(set);
      if (checked) next.add(choice);
      else next.delete(choice);
      return next;
    });
  }

  protected back(): void {
    const index = this.stepIndex();
    if (index > 0) this.show(STEPS[index - 1]);
  }

  protected saveAbout(): void {
    const errors: Record<string, string> = {};
    if (!this.name().trim()) errors['name'] = this.i18n.t('identity.errors.nameRequired');
    if (this.neighbourhoodId() === null)
      errors['hood'] = this.i18n.t('profiles.errors.neighbourhood');
    if (this.role() === null) errors['role'] = this.i18n.t('profiles.errors.role');
    if (this.invalid(errors)) return;

    this.submit(
      this.api.saveOnboardingAbout({
        name: this.name().trim(),
        neighbourhoodId: this.neighbourhoodId(),
        role: this.role(),
      }),
      { name: 'name', neighbourhood_id: 'hood', role: 'role' },
    );
  }

  protected saveSkills(): void {
    const entries: SkillEntry[] = this.selectedSkills().map((id) => ({ id }));
    const other = this.otherSkill().trim();
    if (other) entries.push({ name: other });
    if (entries.length > MAX_SKILLS) {
      this.invalid({ skills: this.i18n.t('profiles.errors.skillsMax') });
      return;
    }
    this.submit(this.api.saveOnboardingSkills(entries), { skills: 'skills' });
  }

  protected finish(): void {
    this.errors.set({});
    this.busy.set(true);
    this.api
      .saveOnboardingGoals({ openTo: [...this.openTo()], building: this.building().trim() || null })
      .subscribe({
        next: () =>
          this.api.completeOnboarding().subscribe({
            next: (progress) => {
              this.busy.set(false);
              this.progress.set(progress);
              const member = this.session.member();
              if (member) this.session.member.set({ ...member, onboardingComplete: true });
              this.show('success');
            },
            error: (error: unknown) => this.rejected(error, {}),
          }),
        error: (error: unknown) => this.rejected(error, { open_to: 'goals', building: 'building' }),
      });
  }

  private submit(
    request: ReturnType<typeof this.api.getOnboarding>,
    fields: Record<string, string>,
  ): void {
    this.errors.set({});
    this.busy.set(true);
    request.subscribe({
      next: (progress) => {
        this.busy.set(false);
        this.progress.set(progress);
        this.show(progress.nextStep === 'finish' ? 'goals' : progress.nextStep);
      },
      error: (error: unknown) => this.rejected(error, fields),
    });
  }

  /** A 422 shows the invalid state; anything else keeps the answers and offers a retry. */
  private rejected(error: unknown, fields: Record<string, string>): void {
    this.busy.set(false);
    const failure = toApiError(error);
    if (failure.kind === 'validation') {
      const errors: Record<string, string> = {};
      for (const [server, message] of Object.entries(failure.fields)) {
        const field = fields[server.split('.')[0]];
        if (field && !errors[field]) errors[field] = message;
      }
      this.invalid(errors);
      return;
    }
    this.failed(() => undefined);
  }

  private failed(retry: () => void): void {
    this.toasts.show({
      variant: 'danger',
      title: this.i18n.t('profiles.onboarding.errors.failed'),
      action: { label: this.i18n.t('identity.signOut.failed.retry'), run: retry },
    });
  }

  private reload(): void {
    this.api.getOnboarding().subscribe({ next: (progress) => this.resume(progress) });
  }

  /** Opens the first unfinished step with the saved answers filled in (L2-006 criteria 1 and 6). */
  private resume(progress: OnboardingProgress): void {
    this.progress.set(progress);
    this.name.set(progress.about.name);
    this.neighbourhoodId.set(progress.about.neighbourhoodId);
    this.role.set(progress.about.role);
    const catalogue = new Set(progress.skillCatalogue.map((s) => s.id));
    this.selectedSkills.set(progress.skills.filter((s) => catalogue.has(s.id)).map((s) => s.id));
    this.otherSkill.set(progress.skills.find((s) => !catalogue.has(s.id))?.name ?? '');
    this.openTo.set(new Set(progress.goals.openTo));
    this.building.set(progress.goals.building ?? '');
    this.view.set(
      progress.completed ? 'success' : progress.nextStep === 'finish' ? 'goals' : progress.nextStep,
    );
  }

  private show(view: View): void {
    this.view.set(view);
    afterNextRender(() => this.document.getElementById('auth-title')?.focus(), {
      injector: this.injector,
    });
  }

  private invalid(errors: Record<string, string>): boolean {
    if (!Object.keys(errors).length) return false;
    this.errors.set(errors);
    afterNextRender(() => this.document.getElementById('error-summary')?.focus(), {
      injector: this.injector,
    });
    return true;
  }
}
