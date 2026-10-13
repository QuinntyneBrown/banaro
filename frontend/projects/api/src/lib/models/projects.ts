/** How far along a project is, in L2-012's order (D-051). */
export type ProjectStage = 'idea' | 'design' | 'prototype' | 'beta' | 'pilot' | 'launched';
export const PROJECT_STAGES: readonly ProjectStage[] = [
  'idea',
  'design',
  'prototype',
  'beta',
  'pilot',
  'launched',
];

/** Who a project is looking for (L2-012 criterion 1). */
export type LookingForRole =
  'co_founder' | 'technical_co_founder' | 'contributor' | 'advisor' | 'designer' | 'engineer';
export const LOOKING_FOR_ROLES: readonly LookingForRole[] = [
  'technical_co_founder',
  'co_founder',
  'contributor',
  'advisor',
  'engineer',
  'designer',
];

/** What a member enters to share or edit a project. */
export interface ProjectInput {
  name: string;
  summary: string;
  description: string | null;
  stage: ProjectStage;
  lookingFor: LookingForRole[];
  link: string | null;
}

/** A project's owner, linked by their profile id. */
export interface ProjectOwner {
  id: string | null;
  name: string;
  photoUrl?: string | null;
}

/** One project's page (L2-013). */
export interface Project extends ProjectInput {
  id: string;
  feedbackCount: number;
  owner: ProjectOwner;
  isOwn: boolean;
  createdAt: string | null;
  lastActivityAt: string | null;
}

/** One project in the listing (L2-015). */
export interface ProjectCard {
  id: string;
  name: string;
  summary: string;
  stage: ProjectStage;
  lookingFor: LookingForRole[];
  feedbackCount: number;
  owner: ProjectOwner;
}

export interface ProjectQuery {
  q?: string;
  stage?: ProjectStage[];
  lookingFor?: LookingForRole[];
  page?: number;
}

export interface ProjectPage {
  items: ProjectCard[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}
