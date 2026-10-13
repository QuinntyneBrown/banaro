import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import {
  FeedbackItem,
  FeedbackPage,
  Project,
  ProjectInput,
  ProjectPage,
  ProjectQuery,
} from '../models/projects';
import { ProjectsApi } from '../services/projects-api';

/** Fake of the contract for tests: one member's projects in memory. */
export class InMemoryProjectsApi implements ProjectsApi {
  projects: Project[] = [];
  /** Feedback by project id, newest first. */
  feedbackByProject: Record<string, FeedbackItem[]> = {};
  private nextId = 1;

  browse(query: ProjectQuery): Observable<ProjectPage> {
    const term = (query.q ?? '').toLowerCase();
    const items = this.projects
      .filter((p) => p.name.toLowerCase().includes(term))
      .map(({ id, name, summary, stage, lookingFor, feedbackCount, owner }) => ({
        id,
        name,
        summary,
        stage,
        lookingFor,
        feedbackCount,
        owner,
      }));
    return of({ items, total: items.length, page: 1, perPage: 12, lastPage: 1 });
  }

  get(id: string): Observable<Project> {
    const project = this.projects.find((p) => p.id === id);
    return project ? of(project) : throwError(() => new HttpErrorResponse({ status: 404 }));
  }

  share(input: ProjectInput): Observable<Project> {
    const project: Project = {
      ...input,
      id: 'project-' + this.nextId++,
      feedbackCount: 0,
      owner: { id: 'me', name: 'Me' },
      isOwn: true,
      createdAt: null,
      lastActivityAt: null,
    };
    this.projects = [project, ...this.projects];
    return of(project);
  }

  update(id: string, input: ProjectInput): Observable<Project> {
    this.projects = this.projects.map((p) => (p.id === id ? { ...p, ...input } : p));
    return this.get(id);
  }

  delete(id: string): Observable<void> {
    this.projects = this.projects.filter((p) => p.id !== id);
    return of(undefined);
  }

  feedback(id: string, page: number): Observable<FeedbackPage> {
    const all = this.feedbackByProject[id] ?? [];
    const perPage = 5;
    return of({
      items: all.slice((page - 1) * perPage, page * perPage),
      total: all.length,
      page,
      perPage,
      lastPage: Math.max(1, Math.ceil(all.length / perPage)),
    });
  }

  giveFeedback(id: string, body: string): Observable<FeedbackItem> {
    const item: FeedbackItem = {
      id: String(this.nextId++),
      body,
      createdAt: new Date().toISOString(),
      author: { id: 'me', name: 'Me', photoUrl: null },
    };
    this.feedbackByProject[id] = [item, ...(this.feedbackByProject[id] ?? [])];
    return of(item);
  }
}
