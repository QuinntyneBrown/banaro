import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import { JoinRequest, MemberSession, SignInRequest } from '../models/identity';

export interface IdentityApi {
  join(request: JoinRequest): Observable<void>;
  /** The current member, or null for a visitor. */
  getSession(): Observable<MemberSession | null>;
  signIn(request: SignInRequest): Observable<MemberSession>;
  signOut(): Observable<void>;
}

export const IDENTITY_API = new InjectionToken<IdentityApi>('IDENTITY_API');

interface SessionBody {
  member: { id: number; name: string; email: string; email_verified: boolean } | null;
}

function toMember(body: SessionBody): MemberSession | null {
  const m = body.member;
  return m ? { id: m.id, name: m.name, email: m.email, emailVerified: m.email_verified } : null;
}

@Injectable()
export class HttpIdentityApi implements IdentityApi {
  private readonly http = inject(HttpClient);

  join(request: JoinRequest): Observable<void> {
    return this.http
      .post('/api/v1/join', {
        name: request.name,
        email: request.email,
        password: request.password,
        agreed_to_code_of_conduct: request.agreedToCodeOfConduct,
      })
      .pipe(map(() => undefined));
  }

  getSession(): Observable<MemberSession | null> {
    return this.http.get<SessionBody>('/api/v1/session').pipe(map(toMember));
  }

  signIn(request: SignInRequest): Observable<MemberSession> {
    return this.http
      .post<SessionBody>('/api/v1/session', { email: request.email, password: request.password })
      .pipe(map((body) => toMember(body) as MemberSession));
  }

  signOut(): Observable<void> {
    return this.http.delete('/api/v1/session').pipe(map(() => undefined));
  }
}
