import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import {
  JoinRequest,
  MemberSession,
  ResendVerificationRequest,
  SignInRequest,
  VerificationOutcome,
} from '../models/identity';
import { IdentityApi } from '../services/identity-api';

/** Fake of the contract for tests: records joins and holds accounts by e-mail and password. */
export class InMemoryIdentityApi implements IdentityApi {
  readonly joined: JoinRequest[] = [];
  readonly accounts: (MemberSession & { password: string })[] = [];
  session: MemberSession | null = null;
  /** Unused verification tokens; a consumed one moves to `usedTokens`. */
  readonly verificationTokens = new Set<string>();
  readonly usedTokens = new Set<string>();
  readonly resends: ResendVerificationRequest[] = [];

  join(request: JoinRequest): Observable<void> {
    this.joined.push(request);
    return of(undefined);
  }

  getSession(): Observable<MemberSession | null> {
    return of(this.session);
  }

  signIn(request: SignInRequest): Observable<MemberSession> {
    const account = this.accounts.find(
      (a) => a.email === request.email.trim().toLowerCase() && a.password === request.password,
    );
    if (!account) {
      return throwError(
        () => new HttpErrorResponse({ status: 422, error: { code: 'invalid_credentials' } }),
      );
    }
    const member: MemberSession = {
      id: account.id,
      name: account.name,
      email: account.email,
      emailVerified: account.emailVerified,
    };
    this.session = member;
    return of(member);
  }

  signOut(): Observable<void> {
    this.session = null;
    return of(undefined);
  }

  verifyEmail(token: string): Observable<VerificationOutcome> {
    if (this.verificationTokens.delete(token)) {
      this.usedTokens.add(token);
      return of('verified');
    }
    return of({ invalid: true, linkKnown: this.usedTokens.has(token) });
  }

  resendVerification(request: ResendVerificationRequest): Observable<void> {
    this.resends.push(request);
    return of(undefined);
  }
}
