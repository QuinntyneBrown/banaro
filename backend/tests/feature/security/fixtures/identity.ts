import type { RouteOwnershipFixture } from './ownership';

export const identityFixtures: RouteOwnershipFixture[] = [
  // Signing out ends the caller's own session only (L2-003).
  {
    route: 'DELETE /api/v1/session',
    expect: 'self_only',
    arrange: async (owner) => ({ sentinels: [owner.email] }),
  },
];
