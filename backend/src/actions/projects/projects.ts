import { and, desc, eq, exists, inArray, sql, type SQL } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { projectLookingFor, projects, type Project } from '../../db/schema/projects';
import type { User } from '../../db/schema/users';
import { HttpError, notFound } from '../../http/pipeline';
import type { ProjectInput } from '../../http/requests/projects/share-project-request';
import { normalizeSearch, prefixQuery } from '../../services/directory/builder-search-text';
import { isBlockedEitherWay, sqlBlockScope } from '../../services/trust-and-safety/block-service';
import { t } from '../../services/user-experience/catalogue-service';
import { ulid } from '../../ulid';

/** The most projects one member may own (L2-012 criterion 4). */
export const PROJECT_LIMIT = 10;

type Tx = Parameters<Parameters<ReturnType<typeof orm>['transaction']>[0]>[0];

const fields = (input: ProjectInput) => ({
  name: input.name,
  summary: input.summary,
  description: input.description ?? null,
  stage: input.stage,
  link: input.link ?? null,
  searchText: normalizeSearch(`${input.name} ${input.summary}`),
});

async function setLookingFor(tx: Tx, projectId: number, roles: string[]) {
  await tx.delete(projectLookingFor).where(eq(projectLookingFor.projectId, projectId));
  const unique = [...new Set(roles)];
  if (unique.length) {
    await tx.insert(projectLookingFor).values(unique.map((role) => ({ projectId, role })));
  }
}

/**
 * Creates a project owned by the member (L2-012). The member's row is locked first, so two shares at
 * once cannot both slip under the limit of 10 (criterion 4).
 */
export async function shareProject(
  db: pg.Pool,
  owner: User,
  input: ProjectInput,
): Promise<Project> {
  return orm(db).transaction(async (tx) => {
    await tx.execute(sql`select id from users where id = ${owner.id} for update`);
    if ((await tx.$count(projects, eq(projects.ownerId, owner.id))) >= PROJECT_LIMIT) {
      throw new HttpError(422, {
        code: 'project_limit',
        message: t('projects.errors.limit', { limit: PROJECT_LIMIT }),
      });
    }
    const now = nowStamp();
    const [project] = await tx
      .insert(projects)
      .values({
        ...fields(input),
        publicId: ulid(),
        ownerId: owner.id,
        lastActivityAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    await setLookingFor(tx, project.id, input.looking_for);
    return project;
  });
}

/** Replaces a project's fields and roles, and counts the edit as activity (L2-014 criterion 1). */
export async function updateProject(
  db: pg.Pool,
  project: Project,
  input: ProjectInput,
): Promise<Project> {
  return orm(db).transaction(async (tx) => {
    const now = nowStamp();
    const [updated] = await tx
      .update(projects)
      .set({ ...fields(input), lastActivityAt: now, updatedAt: now })
      .where(eq(projects.id, project.id))
      .returning();
    await setLookingFor(tx, project.id, input.looking_for);
    return updated;
  });
}

/** Removes a project; its roles, feedback and help offers go with it by foreign key (L2-014). */
export async function deleteProject(db: pg.Pool, project: Project): Promise<void> {
  await orm(db).delete(projects).where(eq(projects.id, project.id));
}

/** The project with this public id, or 404. */
export async function findProject(db: pg.Pool, publicId: string): Promise<Project> {
  if (!/^[0-9a-z]{26}$/.test(publicId)) throw notFound();
  const [project] = await orm(db).select().from(projects).where(eq(projects.publicId, publicId));
  if (!project) throw notFound();
  return project;
}

/**
 * A project anyone may read (D-051); one whose owner and the viewer have blocked each other answers
 * the same 404 as a missing one (D-052).
 */
export async function viewProject(
  db: pg.Pool,
  viewer: User | null,
  publicId: string,
): Promise<Project> {
  const project = await findProject(db, publicId);
  if (viewer && (await isBlockedEitherWay(db, viewer.id, project.ownerId))) throw notFound();
  return project;
}

/** Projects a page of the listing shows (L2-015 criterion 1). */
export const PROJECTS_PER_PAGE = 12;

/**
 * One page of projects, most recently active first (L2-015). Search matches name and summary by word
 * prefix; stages and roles each match any of their values, and all filters apply together. Projects
 * of a member blocked either way are left out (L2-032). A page past the end shows the last one.
 */
export async function browseProjects(
  db: pg.Pool,
  viewer: User | null,
  filters: { term: string | null; stages: string[]; roles: string[]; page: number },
) {
  const conditions: SQL[] = [];
  if (viewer) conditions.push(sqlBlockScope(viewer.id, sql`${projects.ownerId}`));
  if (filters.term !== null && filters.term.trim() !== '') {
    const tsQuery = prefixQuery(filters.term);
    conditions.push(
      tsQuery === null
        ? sql`false`
        : sql`to_tsvector('simple', ${projects.searchText}) @@ to_tsquery('simple', ${tsQuery})`,
    );
  }
  if (filters.stages.length) conditions.push(inArray(projects.stage, filters.stages));
  if (filters.roles.length) {
    conditions.push(
      exists(
        orm(db)
          .select({ one: sql`1` })
          .from(projectLookingFor)
          .where(
            and(
              eq(projectLookingFor.projectId, projects.id),
              inArray(projectLookingFor.role, filters.roles),
            ),
          ),
      ),
    );
  }
  const where = and(...conditions);
  const total = await orm(db).$count(projects, where);
  const lastPage = Math.max(1, Math.ceil(total / PROJECTS_PER_PAGE));
  const page = Math.min(filters.page, lastPage);
  const rows = await orm(db)
    .select()
    .from(projects)
    .where(where)
    .orderBy(desc(projects.lastActivityAt), desc(projects.id))
    .limit(PROJECTS_PER_PAGE)
    .offset((page - 1) * PROJECTS_PER_PAGE);
  return { rows, total, page, lastPage };
}
