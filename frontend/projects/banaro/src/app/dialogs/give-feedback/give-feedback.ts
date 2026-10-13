import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FeedbackItem,
  PROJECTS_API,
  retryAfterMinutes,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import { Alert, Button, Dialog, Field, fieldDescriptionId, Textarea } from 'components';

export interface GiveFeedbackData {
  projectId: string;
  projectName: string;
  ownerName: string;
  commentCount: number;
}

const MIN = 10;
const MAX = 1000;

type Failure = 'failed' | 'slow-down' | 'refused';

/**
 * Posts feedback on a project (L2-016). The text is checked against the same limits the API holds,
 * so a short or empty comment is explained at once; while posting, the text is read-only and
 * "Cancel" stays available; a failure keeps the text and offers "Try again". Closes with the new
 * `FeedbackItem` once it is posted.
 */
@Component({
  selector: 'bn-give-feedback-dialog',
  imports: [Alert, Button, Dialog, Field, FormsModule, TranslatePipe, Textarea],
  template: `
    <bn-dialog
      [heading]="'projects.feedback.title' | t: { name: data.projectName }"
      [description]="'projects.feedback.description' | t: { owner: firstName() }"
      [closeLabel]="'projects.feedback.closeLabel' | t"
      [busy]="busy()"
      closableWhileBusy
      form
      (submitted)="post()"
    >
      <svg slot="icon" class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 6.5h14v9H12l-4 3.5v-3.5H5z" />
      </svg>
      @if (failure(); as kind) {
        <bn-alert variant="danger" [heading]="alertTitle(kind)">
          {{ alertBody(kind) }}
        </bn-alert>
      }
      <p class="about">
        <span class="about__name">{{ data.projectName }}</span>
        {{ 'projects.feedback.about' | t: { owner: data.ownerName, count: data.commentCount } }}
      </p>
      <bn-field
        [label]="'projects.feedback.label' | t"
        controlId="fb-comment"
        [help]="'projects.feedback.help' | t: { owner: firstName() }"
        [error]="error()"
      >
        <textarea
          #box
          bn-textarea
          id="fb-comment"
          name="fb-comment"
          rows="5"
          [ngModel]="text()"
          (ngModelChange)="text.set($event)"
          [readonly]="busy()"
          [invalid]="!!error()"
          [attr.aria-describedby]="describedBy('fb-comment', error(), true)"
        ></textarea>
      </bn-field>
      <button slot="actions" bn-button variant="quiet" type="button" (click)="cancel()">
        {{ 'projects.feedback.cancel' | t }}
      </button>
      <button
        slot="actions"
        bn-button
        variant="primary"
        type="submit"
        [busy]="busy()"
        [disabled]="busy()"
      >
        {{
          busy()
            ? ('projects.feedback.posting' | t)
            : failure()
              ? ('projects.feedback.tryAgain' | t)
              : ('projects.feedback.post' | t)
        }}
      </button>
    </bn-dialog>
  `,
  styles: `
    .about {
      margin: 0;
      color: var(--color-fg-muted);
    }
    .about__name {
      color: var(--color-fg-default);
      font-weight: var(--font-weight-semibold);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiveFeedbackDialog {
  private readonly ref = inject<DialogRef<FeedbackItem | undefined>>(DialogRef);
  private readonly api = inject(PROJECTS_API);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  protected readonly data = inject<GiveFeedbackData>(DIALOG_DATA);
  protected readonly describedBy = fieldDescriptionId;
  private readonly box = viewChild('box', { read: ElementRef<HTMLTextAreaElement> });

  protected readonly text = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | undefined>(undefined);
  protected readonly failure = signal<Failure | null>(null);
  private readonly waitMinutes = signal(1);

  protected readonly firstName = computed(() => this.data.ownerName.split(/\s+/)[0]);

  protected alertTitle(kind: Failure): string {
    return this.i18n.t(
      kind === 'slow-down'
        ? 'projects.feedback.slowDown.title'
        : kind === 'refused'
          ? 'projects.feedback.refused.title'
          : 'projects.feedback.failed.title',
    );
  }

  protected alertBody(kind: Failure): string {
    return kind === 'slow-down'
      ? this.i18n.t('projects.feedback.slowDown.body', { minutes: this.waitMinutes() })
      : kind === 'refused'
        ? this.i18n.t('projects.feedback.refused.body')
        : this.i18n.t('projects.feedback.failed.body');
  }

  protected post(): void {
    if (this.busy()) return;
    const body = this.text().trim();
    const problem = this.check(body);
    if (problem) {
      this.show(problem);
      return;
    }
    this.busy.set(true);
    this.error.set(undefined);
    this.failure.set(null);
    this.api.giveFeedback(this.data.projectId, body).subscribe({
      next: (item) => this.ref.close(item),
      error: (error: unknown) => {
        this.busy.set(false);
        const failure = toApiError(error);
        if (failure.kind === 'validation') {
          this.show(failure.fields['body'] ?? this.i18n.t('projects.feedback.errors.required'));
        } else if (failure.kind === 'rate-limited') {
          this.waitMinutes.set(retryAfterMinutes(failure.retryAfterSeconds));
          this.failure.set('slow-down');
        } else if (failure.kind === 'rejected' && failure.code === 'feedback_not_allowed') {
          this.failure.set('refused');
        } else {
          this.failure.set('failed');
        }
      },
    });
  }

  protected cancel(): void {
    this.ref.close(undefined);
  }

  private check(body: string): string | null {
    if (!body) return this.i18n.t('projects.feedback.errors.required');
    if (body.length < MIN) return this.i18n.t('projects.feedback.errors.min', { min: MIN });
    if (body.length > MAX) return this.i18n.t('projects.feedback.errors.max', { max: '1,000' });
    return null;
  }

  private show(message: string): void {
    this.error.set(message);
    // After the render, so the dialog's own submit handling cannot take focus back.
    afterNextRender(() => this.box()?.nativeElement.focus(), { injector: this.injector });
  }
}
