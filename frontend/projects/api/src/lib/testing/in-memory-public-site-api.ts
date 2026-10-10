import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ContactMessageRequest } from '../models/public-site';
import { PublicSiteApi } from '../services/public-site-api';

/** Fake of the contract for tests: records sent messages and can answer 422 or 429 on demand. */
export class InMemoryPublicSiteApi implements PublicSiteApi {
  readonly sent: ContactMessageRequest[] = [];
  failWith?: 422 | 429;

  sendContactMessage(request: ContactMessageRequest): Observable<void> {
    if (this.failWith === 429) {
      return throwError(
        () =>
          new HttpErrorResponse({
            status: 429,
            headers: new HttpHeaders({ 'Retry-After': '3600' }),
          }),
      );
    }
    if (this.failWith === 422) {
      return throwError(
        () => new HttpErrorResponse({ status: 422, error: { errors: { email: ['Invalid'] } } }),
      );
    }
    this.sent.push(request);
    return of(undefined);
  }
}
