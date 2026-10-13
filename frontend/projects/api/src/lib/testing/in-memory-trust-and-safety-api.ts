import { Observable, of } from 'rxjs';
import { BlockedBuilder } from '../models/trust-and-safety';
import { TrustAndSafetyApi } from '../services/trust-and-safety-api';

/** Fake of the contract for tests: one member's blocked list in memory. */
export class InMemoryTrustAndSafetyApi implements TrustAndSafetyApi {
  blocked: BlockedBuilder[] = [];

  block(builderId: string): Observable<void> {
    if (!this.blocked.some((b) => b.builderId === builderId)) {
      this.blocked = [
        { builderId, name: builderId, photoUrl: null, blockedAt: new Date().toISOString() },
        ...this.blocked,
      ];
    }
    return of(undefined);
  }

  unblock(builderId: string): Observable<void> {
    this.blocked = this.blocked.filter((b) => b.builderId !== builderId);
    return of(undefined);
  }

  listBlocked(): Observable<BlockedBuilder[]> {
    return of(this.blocked);
  }
}
