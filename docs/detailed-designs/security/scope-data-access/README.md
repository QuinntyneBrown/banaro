# Scope data access

## Overview

Banaro holds personal records for each member: conversations, notifications, settings, match
suggestions, RSVPs and unpublished project drafts. This feature is the mechanism that keeps each of
those records reachable only by the member who owns it. It also keeps each role-restricted action
reachable only by holders of that role. It belongs to the `security` subsystem. It has no screen of its
own; every other slice that exposes data through the Banaro API uses it.

Terms used in this design:

- **owned record** — row that belongs to exactly one member, such as a notification or a draft project
- **participant record** — row shared by a fixed set of members, such as a conversation between two builders
- **ownership scope** — query constraint that limits a result to the records of the current member
- **visibility scope** — query constraint that removes records hidden from the current viewer by privacy settings or the block list
- **block list** — set of member ids that the viewer has blocked or that have blocked the viewer
- **anonymous route** — API route declared in `src/http/public-routes.ts` that answers without a session
- **guarded field** — attribute that a member never sets through a request body, such as `owner_id`, `role` or `verified_at`
- **route-ownership fixture** — test helper that creates a record owned by one member for one route, so a second member can try to reach it
- **cross-user access suite** — integration tests in `backend/tests/feature/security` that call every authenticated route as a second member

The mechanism has five layers. Routes require a session unless they are declared anonymous. Queries
reach owned records through the member, so another member's record is never loaded. Policies give a
second check and answer 404 for records of other members. Request schemas and model allow-lists drop
guarded fields. Listing queries apply visibility scopes on the server, including the block list. The
cross-user access suite exercises every route with a second member and fails when a route has no
fixture.

## Description

The slice spans the Banaro API, its test suite and the shared frontend libraries. The representative
request is member A asking for member B's conversation by id.

### Backend — routing and authentication

- **`src/http/pipeline.ts`** — defines the route stacks that every `route.ts` wraps its handlers in
  with `handle(stack, fn)`. Each route file exports its `stack`, so the order is fixed in one place:
  1. `member` — the `api` stack plus `auth` and `requireVerifiedEmail`. Every route on it requires a
     signed-in, verified member. A request without a session ends in an `UnauthenticatedError`,
     rendered as 401 with code `unauthenticated` (`L2-044` criterion 3). `profile` adds
     `requireCompleteProfile`, and `admin` adds `requireAdministrator`.
  2. `api` — the global stack plus session, CSRF, throttle and bindings, with no authentication.
     Only routes listed in `src/http/public-routes.ts` may use it. They are the deliberate anonymous
     routes, such as join, sign-in, the public directory and the i18n catalogue.
- **Error rendering** (`src/http/pipeline.ts`, error boundary) — renders `NotFoundError` as 404 with
  code `not_found` and no table name, id or other detail. It renders a policy denial with the status
  the policy chose.
- **Administrator routes** — the `/api/v1/admin/*` routes use the `admin` stack. A member without the
  administrator role receives 403, as `L2-033` criterion 4 states. Role restriction is the one case
  that answers 403 rather than 404.

### Backend — ownership and participant scopes

- **Ownership helpers** (`src/db/scopes.ts`) — `ownedBy(table, member)` returns the Drizzle
  condition `table.owner_column = member.id` for owned tables. Owned tables include `notifications`,
  `match_suggestions`, `rsvps`, `email_preferences` and draft `projects`.
- **Query through the member** — actions read owned records with the ownership condition in the
  same `where` clause as the id, for example `notifications` where `id` and `notifiable_id` both
  match. A record of another member is never loaded, so the response is the same 404 as for an id
  that does not exist (`L2-044` criterion 1).
- **Participant scope** — `withParticipant(member)` restricts conversations and their messages to
  the two participants. Any other member receives 404 (`L2-026` criterion 9).
- **Bindings middleware** (`src/http/middleware/bindings.ts`) — resolves each dynamic segment
  (`[project]`, `[builder]`, `[conversation]`, …) through a resolver registered for that segment.
  Each resolver loads the row through the ownership, participant or visibility scope of the current
  member and throws `NotFoundError` otherwise. Lookup by id alone is not used for owned tables.
- **`{Model}Policy`** (`src/policies/`) — second guard on every owned and participant table, for
  example `ConversationPolicy` and `ProjectPolicy`. A denial for another member's record is
  `denyAsNotFound()`, so a policy failure also answers 404. A request schema's `authorize()` or the
  route handler calls the policy before calling an action.
- **Resources** (`src/http/resources/{subsystem}/`) — each resource builds its output object field by
  field and never spreads a row. Fields that the owner has hidden (`L2-036`) are left out of the
  object, not set to `null`.

### Backend — guarded fields

- **Request schemas** — each `{Verb}{Noun}Request` is a zod object that lists only the fields a
  member may set. zod strips unknown keys, and actions receive only the parsed data, so unknown and
  guarded fields never reach them (`L2-044` criterion 4). The `validate-input-and-harden-transport`
  feature describes `validate()`.
- **Explicit writes** — actions build each insert and update from named fields of the parsed data.
  No action passes a request body or a parsed object straight to `insert()` or `set()`.
- **Ownership from the session** — actions set `owner_id`, `user_id`, `author_id` and similar keys
  from `ctx.user`, never from input. `role`, `email_verified_at` and `status` change only through
  their own actions.

### Backend — listing scopes and the block list

- **`BlockService`** (`src/services/trust-and-safety/`) — `blockedIdsFor(viewer: User)` returns the ids
  of members the viewer has blocked and of members who have blocked the viewer. It caches the set in
  Redis per viewer and forgets the entry when a block or unblock is written. `isBlockedPair(a: User,
  b: User)` answers whether either has blocked the other. The `block-builder` feature owns the block
  records; this feature defines how listings consume them.
- **Visibility scopes** (`src/db/scopes.ts`) — listing queries add `visibleTo(table, viewer)`, where
  `viewer` may be `null` for a visitor.
  Each scope excludes the viewer's block list, applies privacy settings such as "Members only" for
  visitors (`L2-036` criterion 2), and hides unpublished drafts of other members. The directory,
  projects, project feedback, event attendee lists, match suggestions and search all query through
  this scope. Filtering therefore happens on the server, never only in the browser (`L2-044`
  criterion 5).
- **Interaction checks** — write actions that involve another member, such as giving feedback or
  sending a message, call `BlockService.isBlockedPair()`. They answer 403 as `L2-016` criterion 6
  and `L2-026` criterion 7 state. Reads of a blocker's profile or conversations answer 404 as
  `L2-032` criterion 4 states.

### Backend — cross-user access suite

The suite lives in `backend/tests/feature/security/` and runs with the other integration tests.

- **`RouteOwnershipFixture`** — interface for one route's fixture. `routeName()` names the route.
  `arrange(owner: User): unknown[]` creates the owner's record and returns the route parameters.
  `expectation()` returns `NotFound`, `Forbidden` (role routes) or `SelfOnly` (routes without an id,
  such as `GET /me/notifications`). `sentinels(owner: User): unknown[]` lists values, such as the owner's
  name and a message body, that the response to the second member shall not contain.
- **`RouteOwnershipRegistry`** — maps each route name to its fixture. Fixtures live in
  `tests/feature/security/fixtures/`, one module per subsystem, for example `messaging.ts`.
- **`CrossUserAccessTest`** — enumerates every route whose exported `stack` includes `auth`,
  through the route table that `tests/support/router.ts` builds from `app/**/route.ts`. For each route it looks up the fixture and fails with the route name when
  none is registered (`L2-044` criterion 2). It then signs in member B, arranges B's record, signs in
  member A and calls the route. It asserts the expected status and asserts that the body contains no
  sentinel value (`L2-044` criterion 1).
- **`UnauthenticatedAccessTest`** — calls every route whose stack includes `auth` without a session and
  asserts 401 (`L2-044` criterion 3).
- **`GuardedFieldsTest`** — for each write route whose fixture declares writable input, sends the
  valid body plus `owner_id`, `role` and `verified_at`. It asserts that the stored record keeps the
  session member as owner and that the member's role and verification are unchanged (`L2-044`
  criterion 4).
- **`ListingVisibilityTest`** — for each fixture flagged as a listing, makes B block A and asserts
  that A's listing excludes B's records, and the reverse (`L2-044` criterion 5).

Each test file carries the acceptance-test header from the L2 conventions, naming `L2-044`.

### Frontend — `banaro` and `admin` applications and the `api` library

- **`credentialsInterceptor`** (`api` library, `lib/auth/`) — sends the session cookie with every
  `/api/v1` request. The browser holds no owner id or role to send.
- **`unauthorizedInterceptor`** (`api` library, `lib/auth/`) — turns a 401 into the
  `session-expired` dialog that the `recover-expired-session` feature (`L2-005`) describes.
- **`authGuard`** and **`adminGuard`** (`api` library, `lib/auth/`) — route guards that keep visitors
  out of member pages and non-administrators out of `/admin`. They improve navigation only; the API
  remains the authority.
- **Pages** — a page that receives 404 for a record shows its `not-found` state, which never says
  whether the record exists. A 403 leads to the `forbidden` page (`L2-042` criterion 2).

### Open points

- **Conflict with `AGENTS.md`.** `L2-044` criterion 2 states that the suite fails when a route lacks
  a registered fixture. `AGENTS.md` forbids tests that assert the shape of the codebase. The
  missing-fixture failure is a coverage check, not a behaviour check. This design keeps it because
  the requirement demands it. The project owner should confirm the exception or restate criterion 2.
- **Status for blocked interactions.** `L2-016` criterion 6 and `L2-026` criterion 7 answer 403 for
  a blocked pair, while `L2-032` criterion 4 and `L2-044` criterion 1 answer 404. The design applies
  403 to writes and 404 to reads. Confirmation that a 403 may reveal the block is `<TO SUPPLY>`.
- Cache lifetime of the block list in Redis, beyond invalidation on change: `<TO SUPPLY>`.
- Whether `/api/v1/admin/*` routes need fixtures of kind `Forbidden` for every endpoint, or one
  shared fixture per group: `<TO SUPPLY>`.

## Requirements

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-044` | `L1-014` | Every record a member owns shall be reachable only by that member, and every role-restricted action by that role only. |

The design realizes all five acceptance criteria of `L2-044`. The Description cites each criterion
where a component or test enforces it.

## Diagrams

### System context

Members, visitors and administrators reach Banaro over HTTPS. The CI pipeline runs the cross-user
access suite against every route before a release.

![C4 system context for scoping data access](diagrams/c4-context.png)

### Containers

Banaro Web calls the Banaro API with the session cookie. The API resolves owned records in the Banaro
database and reads the cached block list from Redis.

![C4 container view for scoping data access](diagrams/c4-container.png)

### Components

Inside the Banaro API, the `handle()` pipeline runs authentication before the bindings middleware, the
policy and the route handler. Listing queries call `BlockService` through their `visibleTo` scope. The
cross-user access suite drives the same route handlers in-process.

![C4 component view for scoping data access](diagrams/c4-component.png)

### Class structure

Owned tables share the `ownedBy` scope helper. Each policy denies as not found. The suite's registry
maps route names to fixtures that implement `RouteOwnershipFixture`.

![Class diagram for scoping data access](diagrams/class-structure.png)

### Behaviour — request another member's record

Member A asks for member B's conversation by id. The participant scope finds no row, so the API
answers 404 with no data about B. Alternates show the owner's success and the unauthenticated 401.

![Sequence diagram for requesting another member's record](diagrams/sequence-read-owned-record.png)

### Behaviour — list records with the block list applied

The directory query applies the visibility scope, which reads the block list from `BlockService`. A
blocked builder never reaches the response, so the browser has nothing to filter.

![Sequence diagram for a listing scoped by the block list](diagrams/sequence-list-with-block-scope.png)

### Behaviour — ignore guarded fields

A member updates a project and adds `owner_id` and `role` to the body. The zod request schema strips
them, and the action writes only the named, parsed fields.

![Sequence diagram for ignoring guarded fields](diagrams/sequence-ignore-guarded-fields.png)

### Behaviour — run the cross-user access suite

The pipeline runs the suite. It fails on the first route without a fixture, and otherwise calls each
route as a second member and checks the status and the body.

![Sequence diagram for the cross-user access suite](diagrams/sequence-cross-user-suite.png)
