import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { MemberSession, SignInRequest } from '../models/identity';
import { IDENTITY_API } from '../services/identity-api';

/** Holds the signed-in member as a signal; loaded once at start-up, on the server and in the browser. */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly api = inject(IDENTITY_API);
  private readonly router = inject(Router);

  readonly member = signal<MemberSession | null>(null);
  readonly signedIn = computed(() => this.member() !== null);

  async load(): Promise<void> {
    try {
      this.member.set(await firstValueFrom(this.api.getSession()));
    } catch {
      // A failed load renders the visitor view; member pages ask again through their guard.
      this.member.set(null);
    }
  }

  signIn(request: SignInRequest): Observable<MemberSession> {
    return this.api.signIn(request).pipe(tap((member) => this.member.set(member)));
  }

  /** Ends the session, then shows the signed-out state of the sign-in page (L2-003 criterion 5). */
  signOut(): Observable<void> {
    return this.api.signOut().pipe(
      tap(() => {
        this.member.set(null);
        void this.router.navigateByUrl('/sign-in', { state: { signedOut: true } });
      }),
    );
  }
}
