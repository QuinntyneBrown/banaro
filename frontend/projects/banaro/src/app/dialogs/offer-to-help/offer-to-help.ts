import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HelpOfferView,
  LookingForRole,
  PROJECTS_API,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Alert,
  Button,
  Dialog,
  Field,
  fieldDescriptionId,
  Input,
  Select,
  Textarea,
} from 'components';

export interface OfferToHelpData {
  projectId: string;
  projectName: string;
  ownerName: string;
  /** The roles the project is looking for, which are the only ones an offer may name. */
  roles: readonly LookingForRole[];
}

const MIN = 10;
const MAX = 1000;

type Problem = 'failed' | 'pending' | 'refused';

function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * Offers help with a project (L2-017). The role is one of the project's own "looking for" roles and
 * the message is 10 to 1,000 characters, both checked here and again by the API. While sending, the
 * fields are read-only and "Cancel" stays available; a failure keeps the inputs and offers "Try
 * again". Closes with the recorded `HelpOfferView`.
 */
@Component({
  selector: 'bn-offer-to-help-dialog',
  imports: [Alert, Button, Dialog, Field, FormsModule, Input, Select, Textarea, TranslatePipe],
  template: `
    <bn-dialog
      [heading]="'projects.offer.dialog.title' | t: { name: data.projectName }"
      [description]="'projects.offer.dialog.description' | t: { owner: firstName() }"
      [closeLabel]="'projects.offer.dialog.closeLabel' | t"
      [busy]="busy()"
      closableWhileBusy
      form
      (submitted)="send()"
    >
      <svg slot="icon" class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
      @if (problem(); as kind) {
        <bn-alert variant="danger" [heading]="alertTitle(kind)">
          {{ alertBody(kind) }}
        </bn-alert>
      }
      <p class="about">
        <span class="about__name">{{ data.projectName }}</span>
        {{ 'projects.offer.dialog.lookingFor' | t: { roles: roleNames() } }}
      </p>
      <bn-field
        [label]="'projects.offer.dialog.roleLabel' | t"
        controlId="oh-role"
        [error]="errors()['role']"
      >
        <bn-select>
          <select
            bn-input
            id="oh-role"
            name="oh-role"
            [ngModel]="role()"
            (ngModelChange)="role.set($event)"
            [disabled]="busy()"
            [invalid]="!!errors()['role']"
            [attr.aria-describedby]="describedBy('oh-role', errors()['role'], false)"
          >
            <option value="">{{ 'projects.offer.dialog.rolePlaceholder' | t }}</option>
            @for (option of data.roles; track option) {
              <option [value]="option">{{ roleLabel(option) }}</option>
            }
          </select>
        </bn-select>
      </bn-field>
      <bn-field
        [label]="'projects.offer.dialog.messageLabel' | t"
        controlId="oh-msg"
        [help]="'projects.offer.dialog.messageHelp' | t"
        [error]="errors()['message']"
      >
        <textarea
          bn-textarea
          id="oh-msg"
          name="oh-msg"
          rows="4"
          [ngModel]="message()"
          (ngModelChange)="message.set($event)"
          [readonly]="busy()"
          [invalid]="!!errors()['message']"
          [attr.aria-describedby]="describedBy('oh-msg', errors()['message'], true)"
        ></textarea>
      </bn-field>
      <button slot="actions" bn-button variant="quiet" type="button" (click)="cancel()">
        {{ 'projects.offer.dialog.cancel' | t }}
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
            ? ('projects.offer.dialog.sending' | t)
            : problem()
              ? ('projects.offer.dialog.tryAgain' | t)
              : ('projects.offer.dialog.send' | t)
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
export class OfferToHelpDialog {
  private readonly ref = inject<DialogRef<HelpOfferView | undefined>>(DialogRef);
  private readonly api = inject(PROJECTS_API);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  protected readonly data = inject<OfferToHelpData>(DIALOG_DATA);
  protected readonly describedBy = fieldDescriptionId;

  protected readonly role = signal<string>('');
  protected readonly message = signal('');
  protected readonly busy = signal(false);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly problem = signal<Problem | null>(null);

  protected readonly firstName = computed(() => this.data.ownerName.split(/\s+/)[0]);
  protected readonly roleNames = computed(() =>
    this.data.roles.map((role) => this.roleLabel(role)).join(', '),
  );

  protected roleLabel(role: string): string {
    return this.i18n.t(`projects.roles.${camel(role)}`);
  }

  protected alertTitle(kind: Problem): string {
    return this.i18n.t(`projects.offer.dialog.${kind}.title`);
  }

  protected alertBody(kind: Problem): string {
    return this.i18n.t(`projects.offer.dialog.${kind}.body`);
  }

  protected send(): void {
    if (this.busy()) return;
    const message = this.message().trim();
    const errors = this.check(message);
    if (Object.keys(errors).length) {
      this.show(errors);
      return;
    }
    this.busy.set(true);
    this.errors.set({});
    this.problem.set(null);
    this.api
      .offerHelp(this.data.projectId, { role: this.role() as LookingForRole, message })
      .subscribe({
        next: (offer) => this.ref.close(offer),
        error: (error: unknown) => {
          this.busy.set(false);
          const failure = toApiError(error);
          if (failure.kind === 'validation') {
            this.show({
              ...(failure.fields['role'] ? { role: failure.fields['role'] } : {}),
              ...(failure.fields['message'] ? { message: failure.fields['message'] } : {}),
            });
          } else if (failure.kind === 'rejected' && failure.code === 'offer_pending') {
            this.problem.set('pending');
          } else if (failure.kind === 'rejected' && failure.code === 'offer_not_allowed') {
            this.problem.set('refused');
          } else {
            this.problem.set('failed');
          }
        },
      });
  }

  protected cancel(): void {
    this.ref.close(undefined);
  }

  private check(message: string): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!this.role()) errors['role'] = this.i18n.t('projects.offer.dialog.roleRequired');
    if (!message) errors['message'] = this.i18n.t('projects.offer.errors.required');
    else if (message.length < MIN)
      errors['message'] = this.i18n.t('projects.offer.errors.min', { min: MIN });
    else if (message.length > MAX)
      errors['message'] = this.i18n.t('projects.offer.errors.max', { max: '1,000' });
    return errors;
  }

  /** Shows the errors and moves focus to the first invalid field, after the render. */
  private show(errors: Record<string, string>): void {
    this.errors.set(errors);
    const first = errors['role'] ? 'oh-role' : 'oh-msg';
    afterNextRender(() => document.getElementById(first)?.focus(), { injector: this.injector });
  }
}
