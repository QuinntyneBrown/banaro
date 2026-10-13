import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BlockedBuilder } from '../models/trust-and-safety';

export interface TrustAndSafetyApi {
  block(builderId: string): Observable<void>;
  unblock(builderId: string): Observable<void>;
  listBlocked(): Observable<BlockedBuilder[]>;
}

export const TRUST_AND_SAFETY_API = new InjectionToken<TrustAndSafetyApi>('TRUST_AND_SAFETY_API');

interface BlockedBody {
  builder_id: string;
  name: string;
  photo_url: string | null;
  blocked_at: string;
}

@Injectable()
export class HttpTrustAndSafetyApi implements TrustAndSafetyApi {
  private readonly http = inject(HttpClient);

  block(builderId: string): Observable<void> {
    return this.http
      .put<BlockedBody>(`/api/v1/blocks/${encodeURIComponent(builderId)}`, {})
      .pipe(map(() => undefined));
  }

  unblock(builderId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/blocks/${encodeURIComponent(builderId)}`);
  }

  listBlocked(): Observable<BlockedBuilder[]> {
    return this.http.get<BlockedBody[]>('/api/v1/blocks').pipe(
      map((rows) =>
        rows.map((r) => ({
          builderId: r.builder_id,
          name: r.name,
          photoUrl: r.photo_url,
          blockedAt: r.blocked_at,
        })),
      ),
    );
  }
}
