import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Project,
  ProjectInput,
  PROJECTS_API,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import { Alert, Breadcrumb, Button, EmptyState, PageHeader } from 'components';
import { SeoService } from '../../shared/seo.service';
import { ProjectForm } from './project-form';

/** The API's field names → the form's control ids. */
export const PROJECT_FIELDS: Record<string, string> = {
  name: 'project-name',
  summary: 'project-summary',
  description: 'project-description',
  stage: 'project-stage',
  looking_for: 'project-looking-for',
  link: 'project-link',
};

/** Field errors from a 422, keyed by control id, first message per field. */
export function projectFieldErrors(fields: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, message] of Object.entries(fields)) {
    const id = PROJECT_FIELDS[field.split('.')[0]];
    if (id && !errors[id]) errors[id] = message;
  }
  return errors;
}

/** `/projects/new`: share a product in progress (L2-012). */
@Component({
  selector: 'bn-project-new-page',
  imports: [
    Alert,
    Breadcrumb,
    Button,
    EmptyState,
    PageHeader,
    ProjectForm,
    RouterLink,
    TranslatePipe,
  ],
  template: `
    <div class="wrap">
      <div class="narrow">
        @if (shared(); as project) {
          <div class="page-block" role="status">
            <bn-empty-state
              [heading]="'projects.new.success.title' | t: { name: project.name }"
              [headingLevel]="1"
            >
              {{ 'projects.new.success.body' | t: { name: project.name } }}
              <a
                slot="actions"
                bn-button
                variant="primary"
                [routerLink]="['/projects', project.id]"
                >{{ 'projects.new.success.view' | t: { name: project.name } }}</a
              >
              <a slot="actions" bn-button variant="text" routerLink="/projects">{{
                'projects.new.success.back' | t
              }}</a>
            </bn-empty-state>
          </div>
        } @else {
          <bn-breadcrumb [label]="'directory.profile.breadcrumb' | t" [items]="crumbs" />
          <bn-page-header
            [eyebrow]="'projects.eyebrow' | t"
            [heading]="'projects.new.title' | t"
            [sub]="'projects.new.sub' | t"
          />
          <div class="page-block">
            <bn-project-form
              [errors]="errors()"
              [busy]="saving()"
              [submitLabel]="'projects.new.submit' | t"
              [busyLabel]="'projects.new.submitting' | t"
              cancelLink="/projects"
              (submitted)="share($event)"
            >
              @if (limited()) {
                <bn-alert variant="danger" [heading]="'projects.new.limit.title' | t">
                  {{ limited() }}
                </bn-alert>
              }
            </bn-project-form>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .page-block {
      padding-block: var(--space-8) var(--space-16);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectNewPage {
  private readonly api = inject(PROJECTS_API);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected readonly crumbs = [
    { label: this.i18n.t('projects.crumb'), link: '/projects' },
    { label: this.i18n.t('projects.new.title') },
  ];
  protected readonly saving = signal(false);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly limited = signal<string | null>(null);
  protected readonly shared = signal<Project | null>(null);

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('projects.new.meta.title'),
      path: '/projects/new',
      noindex: true,
    });
  }

  protected share(input: ProjectInput): void {
    this.saving.set(true);
    this.errors.set({});
    this.limited.set(null);
    this.api.share(input).subscribe({
      next: (project) => {
        this.saving.set(false);
        this.shared.set(project);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        const failure = toApiError(error);
        if (failure.kind === 'rejected' && failure.code === 'project_limit') {
          this.limited.set(this.i18n.t('projects.errors.limit', { limit: 10 }));
        } else if (failure.kind === 'validation') {
          this.errors.set(projectFieldErrors(failure.fields));
          afterNextRender(() => this.document.getElementById('error-summary')?.focus(), {
            injector: this.injector,
          });
        } else {
          this.limited.set(this.i18n.t('projects.new.failed'));
        }
      },
    });
  }
}
