import { ParamMap } from '@angular/router';
import { LOOKING_FOR_ROLES, LookingForRole, PROJECT_STAGES, ProjectStage } from 'api';

/** What the projects page keeps in its URL (L2-015 criterion 2). */
export interface ProjectsUrl {
  q: string;
  stage: ProjectStage | null;
  lookingFor: LookingForRole | null;
  page: number;
}

/**
 * Turns the URL into the project list's query. An unknown stage or role is dropped, so a tampered
 * link degrades to fewer filters; the API checks them again.
 */
export function decodeProjectsUrl(params: ParamMap): ProjectsUrl {
  const stage = params.get('stage');
  const role = params.get('looking_for');
  const page = Number(params.get('page'));
  return {
    q: (params.get('q') ?? '').trim(),
    stage: PROJECT_STAGES.includes(stage as ProjectStage) ? (stage as ProjectStage) : null,
    lookingFor: LOOKING_FOR_ROLES.includes(role as LookingForRole)
      ? (role as LookingForRole)
      : null,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** What makes a list: everything but the page, which "Show more" grows. */
export function projectsListKey(url: ProjectsUrl): string {
  return JSON.stringify([url.q, url.stage, url.lookingFor]);
}
