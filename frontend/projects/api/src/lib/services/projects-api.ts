import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  FeedbackItem,
  FeedbackPage,
  LookingForRole,
  Project,
  ProjectInput,
  ProjectPage,
  ProjectQuery,
  ProjectStage,
} from '../models/projects';

export interface ProjectsApi {
  browse(query: ProjectQuery): Observable<ProjectPage>;
  get(id: string): Observable<Project>;
  share(input: ProjectInput): Observable<Project>;
  update(id: string, input: ProjectInput): Observable<Project>;
  delete(id: string): Observable<void>;
  /** A page of a project's feedback, newest first, five at a time (L2-016). */
  feedback(id: string, page: number): Observable<FeedbackPage>;
  giveFeedback(id: string, body: string): Observable<FeedbackItem>;
}

export const PROJECTS_API = new InjectionToken<ProjectsApi>('PROJECTS_API');

interface OwnerBody {
  id: string | null;
  name: string;
  photo_url?: string | null;
}

interface ProjectBody {
  id: string;
  name: string;
  summary: string;
  description: string | null;
  stage: ProjectStage;
  looking_for: LookingForRole[];
  link: string | null;
  feedback_count: number;
  owner: OwnerBody;
  is_own: boolean;
  created_at: string | null;
  last_activity_at: string | null;
}

interface CardBody {
  id: string;
  name: string;
  summary: string;
  stage: ProjectStage;
  looking_for: LookingForRole[];
  feedback_count: number;
  owner: OwnerBody;
}

interface FeedbackBody {
  id: string;
  body: string;
  created_at: string;
  author: { id: string | null; name: string; photo_url: string | null };
}

interface FeedbackPageBody {
  items: FeedbackBody[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

function toFeedback(body: FeedbackBody): FeedbackItem {
  return {
    id: body.id,
    body: body.body,
    createdAt: body.created_at,
    author: { id: body.author.id, name: body.author.name, photoUrl: body.author.photo_url },
  };
}

interface PageBody {
  items: CardBody[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

function toProject(body: ProjectBody): Project {
  return {
    id: body.id,
    name: body.name,
    summary: body.summary,
    description: body.description,
    stage: body.stage,
    lookingFor: body.looking_for,
    link: body.link,
    feedbackCount: body.feedback_count,
    owner: { id: body.owner.id, name: body.owner.name, photoUrl: body.owner.photo_url ?? null },
    isOwn: body.is_own,
    createdAt: body.created_at,
    lastActivityAt: body.last_activity_at,
  };
}

function toBody(input: ProjectInput): Record<string, unknown> {
  return {
    name: input.name,
    summary: input.summary,
    description: input.description,
    stage: input.stage,
    looking_for: input.lookingFor,
    link: input.link,
  };
}

function path(id: string): string {
  return '/api/v1/projects/' + encodeURIComponent(id);
}

@Injectable()
export class HttpProjectsApi implements ProjectsApi {
  private readonly http = inject(HttpClient);

  browse(query: ProjectQuery): Observable<ProjectPage> {
    let params = new HttpParams();
    if (query.q) params = params.set('q', query.q);
    for (const stage of query.stage ?? []) params = params.append('stage[]', stage);
    for (const role of query.lookingFor ?? []) params = params.append('looking_for[]', role);
    if (query.page) params = params.set('page', query.page);
    return this.http.get<PageBody>('/api/v1/projects', { params }).pipe(
      map((body) => ({
        items: body.items.map((c) => ({
          id: c.id,
          name: c.name,
          summary: c.summary,
          stage: c.stage,
          lookingFor: c.looking_for,
          feedbackCount: c.feedback_count,
          owner: { id: c.owner.id, name: c.owner.name },
        })),
        total: body.total,
        page: body.page,
        perPage: body.per_page,
        lastPage: body.last_page,
      })),
    );
  }

  get(id: string): Observable<Project> {
    return this.http.get<ProjectBody>(path(id)).pipe(map(toProject));
  }

  share(input: ProjectInput): Observable<Project> {
    return this.http.post<ProjectBody>('/api/v1/projects', toBody(input)).pipe(map(toProject));
  }

  update(id: string, input: ProjectInput): Observable<Project> {
    return this.http.put<ProjectBody>(path(id), toBody(input)).pipe(map(toProject));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(path(id));
  }

  feedback(id: string, page: number): Observable<FeedbackPage> {
    return this.http
      .get<FeedbackPageBody>(path(id) + '/feedback', { params: new HttpParams().set('page', page) })
      .pipe(
        map((body) => ({
          items: body.items.map(toFeedback),
          total: body.total,
          page: body.page,
          perPage: body.per_page,
          lastPage: body.last_page,
        })),
      );
  }

  giveFeedback(id: string, body: string): Observable<FeedbackItem> {
    return this.http.post<FeedbackBody>(path(id) + '/feedback', { body }).pipe(map(toFeedback));
  }
}
