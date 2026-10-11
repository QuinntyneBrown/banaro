import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LOOKING_FOR_ROLES,
  LookingForRole,
  PROJECT_STAGES,
  ProjectInput,
  ProjectStage,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Button,
  Check,
  Checkbox,
  Field,
  fieldDescriptionId,
  Form,
  FormActions,
  FormError,
  FormSection,
  FormSummary,
  Input,
  Textarea,
} from 'components';

function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * The project form shared by "Share a project" and "Edit project" (L2-012, L2-014): the basics, the
 * stage, who the project is looking for and a link. The page saves it and passes back any errors.
 */
@Component({
  selector: 'bn-project-form',
  imports: [
    Button,
    Check,
    Checkbox,
    Field,
    Form,
    FormActions,
    FormSection,
    FormSummary,
    FormsModule,
    Input,
    RouterLink,
    Textarea,
    TranslatePipe,
  ],
  templateUrl: './project-form.html',
  styles: `
    /* Extracted from docs/design-system/assets/components.css: check-grid, field__help. */
    .check-grid {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    @media (min-width: 36rem) {
      .check-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    .field__help {
      margin: 0 0 var(--space-3);
      font: var(--text-body-sm);
      color: var(--color-fg-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectForm {
  private readonly i18n = inject(TranslationService);

  readonly initial = input<ProjectInput | null>(null);
  /** Field id → message, from the API. */
  readonly errors = input<Record<string, string>>({});
  readonly busy = input(false, { transform: booleanAttribute });
  readonly submitLabel = input.required<string>();
  readonly busyLabel = input.required<string>();
  readonly cancelLink = input.required<string | readonly unknown[]>();
  readonly submitted = output<ProjectInput>();

  protected readonly stages = PROJECT_STAGES;
  protected readonly roles = LOOKING_FOR_ROLES;
  protected readonly describedBy = fieldDescriptionId;

  protected readonly name = signal('');
  protected readonly summary = signal('');
  protected readonly description = signal('');
  protected readonly stage = signal<ProjectStage>('idea');
  protected readonly lookingFor = signal<Set<LookingForRole>>(new Set());
  protected readonly link = signal('');

  protected readonly summaryErrors = computed<FormError[]>(() =>
    Object.entries(this.errors()).map(([controlId, message]) => ({ controlId, message })),
  );

  constructor() {
    effect(() => {
      const initial = this.initial();
      if (!initial) return;
      untracked(() => {
        this.name.set(initial.name);
        this.summary.set(initial.summary);
        this.description.set(initial.description ?? '');
        this.stage.set(initial.stage);
        this.lookingFor.set(new Set(initial.lookingFor));
        this.link.set(initial.link ?? '');
      });
    });
  }

  protected stageLabel(stage: ProjectStage): string {
    return this.i18n.t(`projects.stages.${stage}`);
  }

  protected roleLabel(role: LookingForRole): string {
    return this.i18n.t(`projects.roles.${camel(role)}`);
  }

  protected toggle(role: LookingForRole, on: boolean): void {
    this.lookingFor.update((roles) => {
      const next = new Set(roles);
      if (on) next.add(role);
      else next.delete(role);
      return next;
    });
  }

  protected submit(): void {
    if (this.busy()) return;
    const description = this.description().trim();
    const link = this.link().trim();
    this.submitted.emit({
      name: this.name().trim(),
      summary: this.summary().trim(),
      description: description || null,
      stage: this.stage(),
      lookingFor: this.roles.filter((r) => this.lookingFor().has(r)),
      link: link || null,
    });
  }
}
