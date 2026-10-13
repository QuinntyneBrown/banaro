import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  Injector,
  input,
  RESPONSE_INIT,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  Project,
  ProjectInput,
  PROJECTS_API,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DangerZone,
  DialogService,
  EmptyState,
  ErrorPage,
  PageHeader,
  Skeleton,
  ToastService,
} from 'components';
import { Subscription, timer } from 'rxjs';
import {
  DeleteProjectData,
  DeleteProjectDialog,
} from '../../dialogs/delete-project/delete-project';
import { SeoService } from '../../shared/seo.service';
import { ForbiddenPage } from '../forbidden/forbidden';
import { ProjectForm } from '../project-new/project-form';
import { projectFieldErrors } from '../project-new/project-new';

type State = 'loading' | 'ready' | 'forbidden' | 'not-found' | 'error';

/**
 * `/projects/{id}/edit`: the owner changes or deletes a project (L2-014). Anyone else sees the
 * forbidden page, and an unknown id the not-found page.
 */
@Component({
  selector: 'bn-project-edit-page',
  imports: [
    Alert,
    Breadcrumb,
    Button,
    DangerZone,
    EmptyState,
    ErrorPage,
    ForbiddenPage,
    PageHeader,
    ProjectForm,
    RouterLink,
    Skeleton,
    TranslatePipe,
  ],
  templateUrl: './project-edit.html',
  styleUrl: './project-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectEditPage {
  private readonly api = inject(PROJECTS_API);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly dialogs = inject(DialogService);
  private readonly toasts = inject(ToastService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly response = inject(RESPONSE_INIT, { optional: true });

  /** The project's public id, from the route. */
  readonly id = input.required<string>();

  protected readonly state = signal<State>('loading');
  protected readonly slow = signal(false);
  protected readonly project = signal<Project | null>(null);
  protected readonly saving = signal(false);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly failed = signal(false);

  protected readonly initial = computed<ProjectInput | null>(() => {
    const p = this.project();
    return p
      ? {
          name: p.name,
          summary: p.summary,
          description: p.description,
          stage: p.stage,
          lookingFor: p.lookingFor,
          link: p.link,
        }
      : null;
  });
  protected readonly crumbs = computed<BreadcrumbItem[]>(() => {
    const p = this.project();
    return [
      { label: this.i18n.t('projects.crumb'), link: '/projects' },
      ...(p ? [{ label: p.name, link: `/projects/${p.id}` }] : []),
      { label: this.i18n.t('projects.edit.crumb') },
    ];
  });

  private request?: Subscription;

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  protected retry(): void {
    this.load(this.id());
  }

  protected save(input: ProjectInput): void {
    const project = this.project();
    if (!project) return;
    this.saving.set(true);
    this.errors.set({});
    this.failed.set(false);
    this.api.update(project.id, input).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.toasts.show({
          variant: 'success',
          title: this.i18n.t('projects.edit.saved.title'),
          body: this.i18n.t('projects.edit.saved.body', { name: saved.name }),
        });
        void this.router.navigate(['/projects', saved.id]);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        const failure = toApiError(error);
        if (failure.kind === 'validation') {
          this.errors.set(projectFieldErrors(failure.fields));
          afterNextRender(() => this.document.getElementById('error-summary')?.focus(), {
            injector: this.injector,
          });
        } else {
          this.failed.set(true);
        }
      },
    });
  }

  /** Opens the confirmation; on success the owner returns to the showcase (L2-014 criterion 4). */
  protected confirmDelete(): void {
    const project = this.project();
    if (!project) return;
    const ref = this.dialogs.open<DeleteProjectDialog, DeleteProjectData, boolean>(
      DeleteProjectDialog,
      {
        data: { projectId: project.id, name: project.name, commentCount: project.feedbackCount },
        size: 'sm',
        described: true,
        autoFocus: 'input[name=confirm-name]',
      },
    );
    ref.closed.subscribe((deleted) => {
      if (!deleted) return;
      this.toasts.show({
        variant: 'success',
        title: this.i18n.t('projects.delete.done.title', { name: project.name }),
        body: this.i18n.t('projects.delete.done.body'),
      });
      void this.router.navigateByUrl('/projects');
    });
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
          this.state.set(project.isOwn ? 'ready' : 'forbidden');
          if (project.isOwn) {
            this.seo.set({
              title: this.i18n.t('projects.edit.meta.title', { name: project.name }),
              path: `/projects/${project.id}/edit`,
              noindex: true,
            });
          }
        },
        error: (error: unknown) => {
          skeletons.unsubscribe();
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.state.set('not-found');
            if (this.response) this.response.status = 404;
          } else {
            this.state.set('error');
          }
        },
      });
  }
}
