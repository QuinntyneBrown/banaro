# Danger zone

| Field | Value |
|---|---|
| Selector | `bn-danger-zone` |
| Library path | `frontend/projects/components/src/lib/danger-zone/` |
| Status | planned |
| Traces to | L2-014, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`danger-zone.html`](../../design-system/components/danger-zone.html) |
| Source mocks | [`pages/project-edit/default`](../../mocks/pages/project-edit/default.html), [`pages/project-edit/invalid`](../../mocks/pages/project-edit/invalid.html), [`pages/project-edit/submitting`](../../mocks/pages/project-edit/submitting.html), [`dialogs/delete-project/default`](../../mocks/dialogs/delete-project/default.html), [`dialogs/delete-project/busy`](../../mocks/dialogs/delete-project/busy.html), [`dialogs/delete-project/invalid`](../../mocks/dialogs/delete-project/invalid.html), [`dialogs/delete-project/failed`](../../mocks/dialogs/delete-project/failed.html) |
| Rendering | [`danger-zone.html`](danger-zone.html) |

## Purpose and scope

The danger zone sets an irreversible action apart from the rest of an edit screen. On Amara's
"Edit Harvest" page it reads "Deleting Harvest removes the project page, its 23 comments and its
insights. This can't be undone." above a quiet red "Delete project" trigger, which opens the
`delete-project` confirmation dialog.

The confirmation itself, with its typed project name and danger button, is the
[dialog](dialog.md); destructive buttons inside it are [buttons](button.md) with `variant="danger"`.

Out of scope:

- The confirmation dialog, its typed-name check and its busy and failed states (L2-014, dialog CRD).
- Deciding who sees the zone; the page renders it only for the owner (L2-014).
- The settings page's "Delete account" section, which the mocks draw without the danger-zone block
  (D-3).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/project-edit/default`, `invalid`, `submitting` (also behind `dialogs/delete-project/*`) | heading "Danger zone", h2, trigger "Delete project" with trash icon | "Deleting Harvest removes the project page, its 23 comments and its insights. This can't be undone." | default; unchanged while the form above is invalid or saving | canvas, below the form card |
| `dialogs/delete-project/*` | page behind the dialog is `inert` | same | trigger is the dialog's return-focus target | canvas under backdrop |

## Anatomy

1. **Region** — `section.danger-zone`, `aria-labelledby` the title. Grid, hairline
   `--color-danger-border` rule, `--radius-lg`.
2. **Title** — `h2.danger-zone__title`, `--text-h4` in `--color-danger-fg`.
3. **Consequence** — `p`, `--color-fg-muted`; names the object and what is lost.
4. **Action row** — `div` holding the trigger.
5. **Trigger** — `button.btn.btn--quiet.link-danger` with a leading trash `svg.icon.icon--sm`
   (`aria-hidden="true"`) and the label.

Host: `bn-danger-zone` is `display: block` and renders the `section` inside. The trigger is a
`button[bn-button]` ([button](button.md)).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | Title text, "Danger zone". |
| `headingLevel` | `2 \| 3` | `2` | no | Renders `h2` or `h3` so the outline stays correct. |
| `actionLabel` | `string` | — | yes | Trigger label, "Delete project". |
| `disabled` | `boolean` | `false` | no | Sets native `disabled` on the trigger, for a page that cannot offer deletion yet. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `actionTriggered` | `void` | The trigger is activated and is not disabled. The page opens the CDK confirmation dialog. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | text or inline content | The consequence paragraph's content; rendered inside the `p`. |

The section id and title id are generated per instance (`bn-dz-{n}`, `bn-dz-{n}-title`) so two
zones on one page never clash.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Project | — | "Delete project" on project edit. |
| Account | — | The same component with "Delete account" copy, if a screen adopts it (D-3). |
| Typed confirmation | — | The design-system page's third variant is the same zone; the typing happens in the dialog it opens. |

One size; width comes from the page column.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Danger rule, danger title, muted consequence, red quiet trigger | Region named "Danger zone" |
| Trigger hover | `:hover` on the button | Button's quiet hover fill (`--color-bg-subtle`); label keeps `--color-danger-fg` | — |
| Trigger focus | `:focus-visible` | `--color-focus-ring` ring, `--focus-ring-width`, `--focus-ring-offset` | "Delete project, button" |
| Trigger active | `:active` | Button's quiet active fill | — |
| Disabled | `disabled` input | Button's disabled colours | Removed from tab order |
| Dialog open | page opened the dialog | Zone under the backdrop, `inert` | Not reachable |
| After dialog closes | dialog dismissed | Unchanged | Focus back on the trigger |
| Invalid, loading | — | None: the zone has no data of its own; while the edit form loads the page omits the zone | — |

## Markup

```html
<!-- rendered -->
<section class="danger-zone" aria-labelledby="bn-dz-1-title">
  <h2 class="danger-zone__title" id="bn-dz-1-title">Danger zone</h2>
  <p>Deleting Harvest removes the project page, its 23 comments and its insights. This can't be undone.</p>
  <div><button type="button" class="btn btn--quiet link-danger"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 4h4M7 7l.8 12.5h8.4L17 7M10 11v5M14 11v5"/></svg>Delete project</button></div>
</section>
```

```html
<!-- consumer -->
<bn-danger-zone [heading]="'projects.edit.danger.title' | t" [actionLabel]="'projects.edit.danger.delete' | t" (actionTriggered)="confirmDelete()">
  {{ 'projects.edit.danger.body' | t: { name: project().name, comments: project().commentCount } }}
</bn-danger-zone>
```

Page objects locate the zone by `.danger-zone` and the trigger by its role and name.

## Design

- Section: grid, gap `--space-4`, padding `--space-6`, radius `--radius-lg`, rule
  `--border-width-hairline` in `--color-danger-border`, no fill.
- Title `--text-h4`; consequence `--text-body`.
- Trigger: quiet button at `--control-height-md`, label colour from `.link-danger`.
- Placed `--space-8` below the form card by the page.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rule | `--color-danger-border` | `--palette-lingon-300` | `--palette-lingon-700` |
| Title, trigger label | `--color-danger-fg` | `--palette-lingon-700` | `--palette-lingon-300` |
| Consequence | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Page behind | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Title and trigger label |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Consequence |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The rule is decorative: the title text and region name carry the meaning, so colour is not the
only signal.

## Responsive behaviour

- The layout does not change across breakpoints; the consequence wraps and the trigger stays
  below it.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; the
  trigger is at least 44 × 44 CSS px.

## Accessibility

### Role and pattern

A `section` named by its heading (a region landmark). The trigger is a native `button` that opens
a modal dialog ([APG dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches the trigger after the form's actions. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Emits `actionTriggered`; the page opens the dialog. |

### Focus

When the dialog opens, focus moves into it (to the typed-name field). When it closes without
deleting, CDK Dialog returns focus to the trigger.

### Labelling

The region's name is the heading text. The trigger's name is its visible label; the icon is
hidden.

### Announcements

None.

### Motion

None beyond the button's own colour transition, which `prefers-reduced-motion: reduce` removes.

## Content and internationalisation

- Name the object and say what is lost and that it cannot be undone: "Deleting Harvest removes
  the project page, its 23 comments and its insights. This can't be undone."
- The trigger names the action and the object: "Delete project", "Delete account". Never "Are you
  sure?".
- Translatable inputs and slots: `heading`, `actionLabel`, the consequence. Data values: the
  project name and comment count, interpolated by the catalogue; the count uses thousands
  separators (L2-052).

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/DangerZone.ts` renders Harvest's
  zone with the copy above; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it
  at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the zone.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the zone renders with the form, not after it, so it never pushes content.
- Weight: composes `Button` only.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara editing Harvest, when the page renders, then below the form there is a `section.danger-zone` named "Danger zone" with the text "Deleting Harvest removes the project page, its 23 comments and its insights. This can't be undone." and a "Delete project" button. (L2-014)
- **AC-2** Given a page that already has an `h1` and `h2` form sections, when the zone renders with `headingLevel` 2, then its title is an `h2.danger-zone__title`, and with `headingLevel` 3 it is an `h3`. (L2-050)

### States

- **AC-3** Given the zone, when Amara activates "Delete project", then `actionTriggered` is emitted once and the page opens the `delete-project` dialog. (L2-014)
- **AC-4** Given the edit form is saving, when Amara looks at the zone, then it is unchanged and its trigger still works. (L2-014)
- **AC-5** Given `disabled` is set, when the trigger is pressed, then nothing is emitted and the button is out of the tab order. (L2-014)

### Keyboard and focus

- **AC-6** Given the `delete-project` dialog opened from the zone, when Amara presses Escape or "Keep project", then the dialog closes and focus returns to "Delete project". (L2-050)
- **AC-7** Given keyboard-only use, when Amara tabs to the trigger, then it shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast against the page. (L2-050)

### Screen readers

- **AC-8** Given a screen reader's landmarks list, when it is opened on project edit, then a region named "Danger zone" is listed and the trash icon is not announced. (L2-050)
- **AC-9** Given the en-CA catalogue, when the zone renders, then the heading, consequence and trigger label come from the catalogue with "Harvest" and "23" interpolated. (L2-052)

### Theming

- **AC-10** Given the dark theme, when the zone renders, then its rule, title and trigger use `--color-danger-border` and `--color-danger-fg` with title and label contrast of at least 4.5:1 against the page. (L2-051)

### Responsive

- **AC-11** Given a 320 px viewport, when the zone renders, then the consequence wraps, the trigger is at least 44 × 44 CSS px, and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-12** Given the `DangerZone` perf-test scenario, when the perf test runs against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- New folder `frontend/projects/components/src/lib/danger-zone/` with `danger-zone.ts`
  (`bn-danger-zone`, class `DangerZone`) and `danger-zone.css` copied from `.danger-zone`,
  `.danger-zone__title`, `.danger-zone p` and `.link-danger` in `components.css`. Export from
  `public-api.ts`.
- Composes `button[bn-button]` with `variant="quiet"`; the trash icon is inline.
- Add `DangerZone.ts` and export it from `src/scenarios/index.ts` in the same change.

## Decisions

- **D-1** *The mock's trigger is an `<a>` to the dialog's file; the app opens dialogs with CDK
  Dialog. Link or button?* A `button` that emits `actionTriggered`. AGENTS.md says button-triggered
  editing opens a CDK Dialog, and a link would promise navigation. The classes stay the same.
- **D-2** *Is the heading always `h2`?* Default `h2`, as in the mock, with `headingLevel` 3 for a
  zone placed inside an `h2` section, so the outline stays correct.
- **D-3** *The design-system page names an "Account" variant, but `pages/settings/default` draws
  "Delete account" as a plain section with an `h2.section__title` and a `link-danger` link, without
  `.danger-zone`. Should settings use this component?* The component supports the account copy,
  but the settings page keeps its mock markup until the mock changes, because the e2e visual
  baselines follow the mock. Raised to the lead.
- **D-4** *Should the trigger be disabled while the edit form saves?* No. The `submitting` mock
  leaves it unchanged; the dialog guards deletion with its own busy state.
