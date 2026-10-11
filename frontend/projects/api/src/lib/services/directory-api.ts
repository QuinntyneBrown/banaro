import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  BuilderCardSummary,
  BuilderProfile,
  DirectoryFacets,
  DirectoryQuery,
  DirectoryResultPage,
} from '../models/directory';
import { BuilderRole, OpenTo } from '../models/profiles';

export interface DirectoryApi {
  searchBuilders(query: DirectoryQuery): Observable<DirectoryResultPage>;
  getBuilder(id: string): Observable<BuilderProfile>;
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
  meta?: {
    facets: {
      role: DirectoryFacets['role'];
      open_to: DirectoryFacets['openTo'];
      area: Record<string, number>;
      skills: DirectoryFacets['skills'];
    } | null;
    distance_km: number | null;
  };
}

interface ProfileBody {
  id: string;
  name: string;
  role: BuilderRole | null;
  headline: string | null;
  photo_url: string | null;
  is_own: boolean;
  neighbourhood?: { name: string; area: string } | null;
  skills?: string[];
  actions?: { say_hello: boolean; report: boolean; block: boolean; edit: boolean };
  distance_km?: number | null;
  distance_from?: string | null;
  match?: BuilderProfile['match'];
  bio?: string;
  experience?: {
    title: string;
    organization: string | null;
    started_on: string;
    ended_on: string | null;
  }[];
  links?: { label: string; url: string }[];
  building?: { summary: string };
  open_to?: OpenTo[];
  online?: boolean;
  last_seen_at?: string | null;
  member_since?: string;
  email?: string;
}

function toProfile(body: ProfileBody): BuilderProfile {
  const profile: BuilderProfile = {
    id: body.id,
    name: body.name,
    role: body.role,
    headline: body.headline,
    photoUrl: body.photo_url,
    isOwn: body.is_own,
  };
  // Absent keys stay absent: hidden or empty fields never become placeholders (L2-011).
  if ('neighbourhood' in body) profile.neighbourhood = body.neighbourhood;
  if (body.skills) profile.skills = body.skills;
  if (body.actions) {
    profile.actions = {
      sayHello: body.actions.say_hello,
      report: body.actions.report,
      block: body.actions.block,
      edit: body.actions.edit,
    };
  }
  if ('distance_km' in body) profile.distanceKm = body.distance_km;
  if ('distance_from' in body) profile.distanceFrom = body.distance_from;
  if (body.match) profile.match = body.match;
  if (body.bio) profile.bio = body.bio;
  if (body.experience) {
    profile.experience = body.experience.map((e) => ({
      title: e.title,
      organization: e.organization,
      startedOn: e.started_on,
      endedOn: e.ended_on,
    }));
  }
  if (body.links) profile.links = body.links;
  if (body.building) profile.building = body.building;
  if (body.open_to) profile.openTo = body.open_to;
  if ('online' in body) profile.online = body.online;
  if ('last_seen_at' in body) profile.lastSeenAt = body.last_seen_at;
  if (body.member_since) profile.memberSince = body.member_since;
  if (body.email) profile.email = body.email;
  return profile;
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
    const filters = query.filters;
    if (filters) {
      for (const role of filters.role) params = params.append('role[]', role);
      for (const openTo of filters.openTo) params = params.append('open_to[]', openTo);
      for (const area of filters.area) params = params.append('area[]', area);
      for (const skill of filters.skills) params = params.append('skills[]', skill);
      if (filters.distance !== null) params = params.set('distance', filters.distance);
    }
    return this.http.get<PageBody>('/api/v1/builders', { params }).pipe(
      map((body) => ({
        items: body.items.map(toCard),
        total: body.total,
        page: body.page,
        perPage: body.per_page,
        lastPage: body.last_page,
        facets: body.meta?.facets
          ? {
              role: body.meta.facets.role,
              openTo: body.meta.facets.open_to,
              area: body.meta.facets.area,
              skills: body.meta.facets.skills,
            }
          : null,
        distanceKm: body.meta?.distance_km ?? null,
      })),
    );
  }

  getBuilder(id: string): Observable<BuilderProfile> {
    return this.http
      .get<ProfileBody>(`/api/v1/builders/${encodeURIComponent(id)}`)
      .pipe(map(toProfile));
  }
}
