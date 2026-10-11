import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BuilderCardSummary, DirectoryQuery, DirectoryResultPage } from '../models/directory';
import { BuilderRole, OpenTo } from '../models/profiles';

export interface DirectoryApi {
  searchBuilders(query: DirectoryQuery): Observable<DirectoryResultPage>;
}

export const DIRECTORY_API = new InjectionToken<DirectoryApi>('DIRECTORY_API');

interface CardBody {
  id: string;
  name: string;
  role: BuilderRole | null;
  headline: string | null;
  neighbourhood: { name: string; area: string } | null;
  skills: string[];
  photo_url: string | null;
  distance_km?: number | null;
  match_score?: number | null;
  building?: string | null;
  open_to?: OpenTo[];
  online?: boolean;
  last_seen_at?: string | null;
}

interface PageBody {
  items: CardBody[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

function toCard(body: CardBody): BuilderCardSummary {
  const card: BuilderCardSummary = {
    id: body.id,
    name: body.name,
    role: body.role,
    headline: body.headline,
    neighbourhood: body.neighbourhood,
    skills: body.skills,
    photoUrl: body.photo_url,
  };
  // Member-only facts stay absent when the API left them out.
  if ('distance_km' in body) card.distanceKm = body.distance_km;
  if ('match_score' in body) card.matchScore = body.match_score;
  if ('building' in body) card.building = body.building;
  if ('open_to' in body) card.openTo = body.open_to;
  if ('online' in body) card.online = body.online;
  if ('last_seen_at' in body) card.lastSeenAt = body.last_seen_at;
  return card;
}

@Injectable()
export class HttpDirectoryApi implements DirectoryApi {
  private readonly http = inject(HttpClient);

  searchBuilders(query: DirectoryQuery): Observable<DirectoryResultPage> {
    let params = new HttpParams();
    if (query.q) params = params.set('q', query.q);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.page) params = params.set('page', query.page);
    if (query.perPage) params = params.set('per_page', query.perPage);
    return this.http.get<PageBody>('/api/v1/builders', { params }).pipe(
      map((body) => ({
        items: body.items.map(toCard),
        total: body.total,
        page: body.page,
        perPage: body.per_page,
        lastPage: body.last_page,
      })),
    );
  }
}
