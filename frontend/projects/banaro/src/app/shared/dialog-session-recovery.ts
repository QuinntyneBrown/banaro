import { DOCUMENT, inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { RecoveryOutcome, SessionRecovery } from 'api';
import { DialogService } from 'components';
import { map, Observable, take, tap } from 'rxjs';
import { SessionExpiredDialog } from '../dialogs/session-expired/session-expired';

const CHANNEL = 'banaro-session';

/**
 * Recovers an expired session through the session-expired dialog. Tabs on the same session follow
 * each other through a BroadcastChannel: when one tab recovers or signs out, an open dialog in
 * another closes the same way (L2-005 criterion 7).
 */
@Injectable()
export class DialogSessionRecovery implements SessionRecovery {
  private readonly dialogs = inject(DialogService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly window = inject(DOCUMENT).defaultView;

  recover(): Observable<RecoveryOutcome> {
    const ref = this.dialogs.open<SessionExpiredDialog, unknown, RecoveryOutcome>(
      SessionExpiredDialog,
      { described: true, autoFocus: 'input[type=password]' },
    );
    const channel = this.window?.BroadcastChannel ? new BroadcastChannel(CHANNEL) : null;
    let fromOtherTab = false;
    if (channel) {
      channel.onmessage = (event: MessageEvent<RecoveryOutcome>) =>
        this.zone.run(() => {
          fromOtherTab = true;
          ref.close(event.data);
        });
    }

    return ref.closed.pipe(
      take(1),
      map((outcome): RecoveryOutcome => outcome ?? 'signed-out'),
      tap((outcome) => {
        if (channel) {
          if (!fromOtherTab) channel.postMessage(outcome);
          channel.close();
        }
        if (outcome === 'signed-out') void this.router.navigateByUrl('/sign-in');
      }),
    );
  }
}
