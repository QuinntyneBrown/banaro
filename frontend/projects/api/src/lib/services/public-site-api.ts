import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ContactMessageRequest } from '../models/public-site';

export interface PublicSiteApi {
  sendContactMessage(request: ContactMessageRequest): Observable<void>;
}

export const PUBLIC_SITE_API = new InjectionToken<PublicSiteApi>('PUBLIC_SITE_API');

@Injectable()
export class HttpPublicSiteApi implements PublicSiteApi {
  private readonly http = inject(HttpClient);

  sendContactMessage(request: ContactMessageRequest): Observable<void> {
    return this.http.post('/api/v1/contact-messages', request).pipe(map(() => undefined));
  }
}
