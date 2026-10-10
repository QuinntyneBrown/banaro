import { DialogRef } from '@angular/cdk/dialog';
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
  RecoveryOutcome,
  retryAfterMinutes,
  SessionStore,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import { Alert, Button, Dialog, Field, Input } from 'components';

type State = 'default' | 'busy' | 'invalid' | 'failed';

/**
 * Over the current page when the session has expired: signing back in keeps everything typed
 * underneath, and "Sign out" leaves for /sign-in (L2-005). Escape and the backdrop do nothing.
 */
@Component({
  selector: 'bn-session-expired-dialog',
  imports: [Alert, Button, Dialog, Field, FormsModule, Input, TranslatePipe],
  templateUrl: './session-expired.html',
  styleUrl: './session-expired.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionExpiredDialog {
  private readonly ref = inject<DialogRef<RecoveryOutcome>>(DialogRef);
  private readonly session = inject(SessionStore);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  protected readonly email = this.session.member()?.email ?? '';
  protected readonly password = signal('');
  protected readonly state = signal<State>('default');
  /** A danger alert above the fields: too many attempts, or the request failed. */
  protected readonly alert = signal<{ title: string; body?: string } | null>(null);
  protected readonly passwordId = `${this.ref.id}-password`;

  protected signIn(): void {
    if (this.state() === 'busy') return;
    this.alert.set(null);
    this.state.set('busy');
    this.session.signIn({ email: this.email, password: this.password() }).subscribe({
      next: () => this.ref.close('recovered'),
      error: (error: unknown) => {
        const failure = toApiError(error);
        this.password.set('');
        if (failure.kind === 'rejected' && failure.code === 'invalid_credentials') {
          this.state.set('invalid');
        } else if (failure.kind === 'rate-limited') {
          this.alert.set({
            title: this.i18n.t('identity.signIn.errors.tooMany', {
              minutes: retryAfterMinutes(failure.retryAfterSeconds),
            }),
          });
          this.state.set('default');
        } else {
          this.alert.set({
            title: this.i18n.t('identity.expired.failed.title'),
            body: this.i18n.t('identity.expired.failed.body'),
          });
          this.state.set('failed');
        }
        afterNextRender(() => this.document.getElementById(this.passwordId)?.focus(), {
          injector: this.injector,
        });
      },
    });
  }

  /** Discards the page and its unsent input (L2-005 criterion 4). */
  protected signOut(): void {
    this.session.member.set(null);
    this.ref.close('signed-out');
  }
}
