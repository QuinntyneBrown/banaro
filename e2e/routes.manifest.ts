import { type Page } from '@playwright/test';
import { type BuilderMember, createBuilder } from './fixtures/builders';
import { createMember, type Member } from './fixtures/members';
import { resetLink } from './fixtures/password-reset';
import { createProject } from './fixtures/projects';
import { BuilderProfilePage } from './pages/builder-profile.page';
import { DirectoryPage } from './pages/directory.page';
import { ProjectPage } from './pages/project.page';
import { ProjectsPage } from './pages/projects.page';

/**
 * Every route in every state the product shows, once, for the checks that walk the whole product:
 * accessibility today, visual parity and page performance later. One entry is one mock state
 * (docs/mocks/manifest.json). A slice that adds a page, dialog or notification adds its entries in
 * the same change, so the checks cover it from day one.
 */

/** Who is signed in when the entry is visited. */
export type Session =
  /** Nobody. */
  | 'visitor'
  /** A verified member with a finished profile. */
  | 'member'
  /** A member who has not yet confirmed their e-mail. */
  | 'unverified'
  /** A verified member who has not finished onboarding. */
  | 'new-member';

/** What an entry's seed leaves behind for its path and its steps. */
export interface EntryContext {
  /** The signed-in member, or null for a visitor. */
  member: Member | BuilderMember | null;
  /** Values the seed produced, such as the id of the builder the page shows. */
  params: Record<string, string>;
}

export interface RouteEntry {
  /** The mock screen: `docs/mocks/<kind>s/<screen>`. */
  screen: string;
  /** The mock state: `docs/mocks/<kind>s/<screen>/<state>.html`. */
  state: string;
  kind: 'page' | 'dialog' | 'notification';
  app: 'banaro' | 'admin';
  session: Session;
  /** The route the entry is visited at; dialogs and notifications use the route they open over. */
  path: string | ((context: EntryContext) => string);
  /** Creates the data the state needs, directly in the database. */
  seed?: (context: EntryContext) => void;
  /** Runs before the visit: holds or fails requests so a loading or error state can be seen. */
  prepare?: (page: Page, context: EntryContext) => Promise<void>;
  /** Runs after the page is ready: opens a dialog or menu, using the screen's page object. */
  reach?: (page: Page, context: EntryContext) => Promise<void>;
  /** Parts of the page to leave out of the accessibility check, with the reason. */
  a11y?: { exclude: string[]; reason: string };
}

const page = (screen: string, state: string, path: RouteEntry['path'], extra: Partial<RouteEntry> = {}): RouteEntry => ({
  screen,
  state,
  kind: 'page',
  app: 'banaro',
  session: 'visitor',
  path,
  ...extra,
});

const asMember: Partial<RouteEntry> = { session: 'member' };

export const routes: RouteEntry[] = [
  // Public pages.
  page('home', 'default', '/'),
  page('about', 'default', '/about'),
  page('contact', 'default', '/contact'),
  page('privacy', 'default', '/privacy'),
  page('code-of-conduct', 'default', '/code-of-conduct'),
  page('join', 'default', '/join'),
  page('sign-in', 'default', '/sign-in'),
  page('forgot-password', 'default', '/forgot-password'),
  page('reset-password', 'default', (c) => c.params['link'], {
    seed: (c) => {
      c.params['link'] = resetLink(createMember());
    },
  }),

  // Error and system pages.
  page('not-found', 'default', '/404'),
  page('forbidden', 'default', '/403'),
  page('server-error', 'default', '/500'),
  page('offline', 'default', '/offline'),
  page('maintenance', 'default', '/maintenance'),

  // Signed-in pages.
  page('verify-email', 'default', '/verify-email', { session: 'unverified' }),
  page('onboarding', 'default', '/welcome', { session: 'new-member' }),
  page('directory', 'default', '/builders', {
    ...asMember,
    seed: () => {
      createBuilder({ name: 'Daniel Reyes', role: 'engineer', skills: ['Laravel', 'Angular'] });
    },
  }),
  page('directory', 'loading', '/builders', {
    ...asMember,
    prepare: async (p) => {
      await new DirectoryPage(p).holdResults();
    },
  }),
  page('directory', 'error', '/builders', {
    ...asMember,
    prepare: async (p) => {
      await new DirectoryPage(p).failResults();
    },
  }),
  page('builder-profile', 'default', (c) => `/builders/${c.params['builder']}`, {
    ...asMember,
    seed: (c) => {
      c.params['builder'] = createBuilder({
        name: 'Daniel Reyes',
        headline: 'Full-stack engineer',
        bio: 'I build volunteer tools for food banks.',
        skills: ['Laravel', 'Angular'],
        building: 'Harvest',
      }).builderId;
    },
  }),
  page('profile-edit', 'default', '/profile/edit', asMember),
  page('settings', 'privacy', '/settings/privacy', asMember),
  page('project-new', 'default', '/projects/new', asMember),
  page('projects', 'default', '/projects', {
    seed: () => {
      createProject(createBuilder({ name: 'Daniel Reyes' }), {
        name: 'Psalter',
        summary: 'Scripture memory with spaced repetition',
        stage: 'beta',
        lookingFor: ['contributor'],
        feedbackCount: 41,
      });
    },
  }),
  page('projects', 'loading', '/projects', {
    reach: async (p) => {
      const projects = new ProjectsPage(p);
      await projects.holdResults();
      await projects.search.fill('anything');
      await projects.skeletons.first().waitFor();
    },
  }),
  page('projects', 'error', '/projects', {
    reach: async (p) => {
      const projects = new ProjectsPage(p);
      await projects.failResults();
      await projects.stage.selectOption({ label: 'Idea' });
      await projects.errorTitle.waitFor();
    },
  }),
  page('projects', 'no-results', '/projects?q=chaplaincy&stage=launched&looking_for=advisor'),
  page('project-detail', 'default', (c) => `/projects/${c.params['project']}`, {
    seed: (c) => {
      c.params['project'] = createProject(createBuilder({ name: 'Daniel Reyes' }), {
        name: 'Psalter',
        summary: 'Scripture memory with spaced repetition',
        description: 'Psalter shows the few verses that are about to slip away.',
        stage: 'beta',
        lookingFor: ['contributor'],
        link: 'https://psalter.example.ca',
        feedbackCount: 41,
      });
    },
  }),
  page('project-detail', 'empty', (c) => `/projects/${c.params['project']}`, {
    seed: (c) => {
      c.params['project'] = createProject(createBuilder({ name: 'Esther Nguyen' }), {
        name: 'Hearth',
        description: 'A weekly meal and prayer rota for small groups.',
        feedbackCount: 0,
      });
    },
  }),
  page('project-detail', 'own', (c) => `/projects/${c.params['project']}`, {
    ...asMember,
    seed: (c) => {
      c.params['project'] = createProject(c.member as Member, {
        name: 'Harvest',
        description: 'Volunteer scheduling for GTA food banks.',
        feedbackCount: 23,
      });
    },
  }),
  page('project-detail', 'not-found', `/projects/${'a'.repeat(26)}`),
  page('project-detail', 'loading', (c) => `/projects?q=${c.params['word']}`, {
    seed: (c) => {
      c.params['word'] = `zeph${Date.now().toString(36)}`;
      createProject(createBuilder(), { name: `${c.params['word']} Ledgerline` });
    },
    reach: async (p) => {
      await new ProjectPage(p).holdLoading();
      await p.getByRole('main').locator('.project__name a').first().click();
      await new ProjectPage(p).loading.first().waitFor();
    },
  }),
  page('project-detail', 'error', (c) => `/projects?q=${c.params['word']}`, {
    seed: (c) => {
      c.params['word'] = `zeph${Date.now().toString(36)}`;
      createProject(createBuilder(), { name: `${c.params['word']} Gather` });
    },
    reach: async (p) => {
      await new ProjectPage(p).failLoading();
      await p.getByRole('main').locator('.project__name a').first().click();
      await new ProjectPage(p).errorTitle.waitFor();
    },
  }),

  // Dialogs and menus, over the page they open from.
  {
    ...page('block-builder', 'default', (c) => `/builders/${c.params['builder']}`, {
      ...asMember,
      seed: (c) => {
        c.params['builder'] = createBuilder({ name: 'Daniel Reyes' }).builderId;
      },
      reach: async (p) => {
        await new BuilderProfilePage(p).block('Daniel');
      },
    }),
    kind: 'dialog',
  },
];
