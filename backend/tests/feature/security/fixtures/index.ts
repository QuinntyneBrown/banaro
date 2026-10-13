import { identityFixtures } from './identity';
import { notificationsFixtures } from './notifications';
import type { RouteOwnershipFixture } from './ownership';
import { profilesFixtures } from './profiles';
import { projectsFixtures } from './projects';
import { settingsFixtures } from './settings';
import { trustAndSafetyFixtures } from './trust-and-safety';

/** Every authenticated route with its cross-user case. A slice that adds a route adds it here. */
export const routeOwnershipFixtures = new Map<string, RouteOwnershipFixture>(
  [
    ...identityFixtures,
    ...profilesFixtures,
    ...settingsFixtures,
    ...trustAndSafetyFixtures,
    ...notificationsFixtures,
    ...projectsFixtures,
  ].map((fixture) => [fixture.route, fixture]),
);
