import { Observable, of } from 'rxjs';
import { JoinRequest } from '../models/identity';
import { IdentityApi } from '../services/identity-api';

/** Fake of the contract for tests: records joins. */
export class InMemoryIdentityApi implements IdentityApi {
  readonly joined: JoinRequest[] = [];

  join(request: JoinRequest): Observable<void> {
    this.joined.push(request);
    return of(undefined);
  }
}
