import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BuilderCardSummary,
  BuilderProfile,
  DirectoryQuery,
  DirectoryResultPage,
} from '../models/directory';
import { DirectoryApi } from '../services/directory-api';

/** Fake of the contract for tests: pages a fixed list of cards, filtered by name. */
export class InMemoryDirectoryApi implements DirectoryApi {
  cards: BuilderCardSummary[] = [];
  profiles: BuilderProfile[] = [];

  getBuilder(id: string): Observable<BuilderProfile> {
    const profile = this.profiles.find((p) => p.id === id);
    return profile ? of(profile) : throwError(() => new HttpErrorResponse({ status: 404 }));
  }

  searchBuilders(query: DirectoryQuery): Observable<DirectoryResultPage> {
    const term = (query.q ?? '').toLowerCase();
    const matching = this.cards.filter((c) => c.name.toLowerCase().includes(term));
    const perPage = query.perPage ?? 12;
    const lastPage = Math.max(1, Math.ceil(matching.length / perPage));
    const page = Math.min(query.page ?? 1, lastPage);
    return of({
      items: matching.slice((page - 1) * perPage, page * perPage),
      total: matching.length,
      page,
      perPage,
      lastPage,
      facets: null,
      distanceKm: null,
    });
  }
}
