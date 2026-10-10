import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import { JoinRequest } from '../models/identity';

export interface IdentityApi {
  join(request: JoinRequest): Observable<void>;
}

export const IDENTITY_API = new InjectionToken<IdentityApi>('IDENTITY_API');

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
}
