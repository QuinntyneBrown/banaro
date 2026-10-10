# Divider

| Field | Value |
|---|---|
| Selector | `hr[bn-divider]` |
| Library path | `frontend/projects/components/src/lib/divider/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051 |
| Design system | [`divider.html`](../../design-system/components/divider.html) |
| Source mocks | [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`dialogs/block-builder/default`](../../mocks/dialogs/block-builder/default.html), [`dialogs/report/default`](../../mocks/dialogs/report/default.html) |
| Rendering | [`divider.html`](divider.html) |

## Purpose and scope

A divider is a hairline that separates groups: menu groups (the account
menu's "Sign out" from the rest, "Report Daniel" from "Block Daniel" in the
profile's *More* menu) and, sparingly, sections of a page. It is quiet by
design; a new section that needs a name gets a heading, not a labelled line.

Use spacing, a heading or a [card](card.md)-style surface instead when the
groups are already distinct. Repeated rows (`.rows`, `.list`, `.card__facts`)
draw their own hairlines; do not add dividers between them.

Out of scope:

- The menu itself, its items and keyboard model ([menu](menu.md)).
- Row borders inside [list](list.md), [table](table.md) and
  [description-list](description-list.md).
- Decorative rules that are part of another block (`.eyebrow::before`,
  `.card__facts` borders).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/account-menu/default` (menu with `role="menu"`) | menu, `role="separator"` | between "Your projects" and "Sign out" | default | raised menu surface |
| `pages/builder-profile/*`, `dialogs/block-builder/*`, `dialogs/report/*` *More actions* (`div.menu role="group"`) | menu, no role (native `hr`) | between "Report Daniel" and "Block Daniel" | default | raised menu surface |
| Design system *Horizontal* | section | between "Profile actions" and "Account actions" | default | surface |
| Design system *Vertical* | vertical, in a `.cluster` | between two inline groups | default | surface |
| Design system *Labelled* | section, `aria-label="Account actions"` | — | default | surface |

## Anatomy

1. **Rule** — the native `hr` (the host, `hr[bn-divider]`) with
   `.divider`, `.divider.divider--vertical` or `.menu__divider`. No children.

Host: the consumer writes `<hr bn-divider>`; the component only sets classes,
`role` and `aria-orientation`. There is no inner element.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'section' \| 'vertical' \| 'menu'` | `'section'` | no | `section` → `.divider`; `vertical` → `.divider.divider--vertical` with `aria-orientation="vertical"`; `menu` → `.menu__divider` with `role="separator"`. |
| `decorative` | `boolean` | `false` | no | Sets `role="presentation"` (`aria-hidden` is not needed on `hr`); use in layouts where the break carries no meaning, such as between two inline clusters. Ignored for `menu`. |

The design system's *Labelled* specimen uses `aria-label` on the `hr`; the
consumer may set `aria-label` directly, but see D-2.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Not interactive. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | `hr` is a void element. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Section (horizontal) | `.divider` | A thematic break between page or panel sections; `--space-6` block margin. |
| Vertical | `.divider--vertical` | Between inline groups in a row; stretches to the row height. |
| Menu | `.menu__divider` | Between groups of menu items; `--space-2` block margin. |
| Labelled | `.divider` + consumer `aria-label` | Design-system specimen only; prefer a heading (D-2). |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | `--border-width-hairline` | margins as above | — |

Width: horizontal dividers fill their container; vertical ones are one
hairline wide.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Hairline in `--color-border-default` | Separator (horizontal or vertical), or presentation |
| Hover, focus, active, disabled | not supported | — | A separator has no keyboard stop (design system *Accessibility*) |
| High contrast | `prefers-contrast: more` / `forced-colors: active` | Line takes `--color-border-strong` / `CanvasText` via tokens | Unchanged |

## Markup

```html
<!-- rendered: section -->
<hr bn-divider class="divider">
```

```html
<!-- rendered: vertical, inside a cluster -->
<div class="cluster"><span>Profile actions</span><hr bn-divider class="divider divider--vertical" aria-orientation="vertical"><span>Account actions</span></div>
```

```html
<!-- rendered: menu -->
<hr bn-divider class="menu__divider" role="separator">
```

```html
<!-- consumer -->
<hr bn-divider variant="menu">
```

## Design

- Section: `border: 0; border-top: --border-width-hairline solid
  --color-border-default; margin-block: --space-6`.
- Vertical: `border-left` hairline, `align-self: stretch`, no block margin.
- Menu: height `--border-width-hairline`, `margin: --space-2 0`, filled with
  `--color-border-default`.
- No motion, no elevation.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Uses `--color-border-default` directly. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Line | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-border-default` | `--color-bg-surface` | none (decorative) | The line separates groups that spacing already separates; WCAG 1.4.11 does not apply to decoration. |

Under `prefers-contrast: more` the token resolves to `--color-border-strong`
(3:1 against surfaces); under `forced-colors: active` to `CanvasText`.

## Responsive behaviour

- No breakpoints. Horizontal dividers shrink with their container; a vertical
  divider in a wrapping cluster stays with the group before it when the row
  wraps.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices (the divider is not a target).

## Accessibility

### Role and pattern

Native `hr` (implicit `separator`). Inside a `role="menu"` it carries an
explicit `role="separator"`, following the
[APG menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd>, arrow keys | Skip the divider; menus move between items only. |

### Focus

Never focusable.

### Labelling

Unlabelled by default. A section needing a name gets a heading.

### Announcements

None.

### Motion

None.

## Content and internationalisation

The divider has no copy. If a consumer sets `aria-label`, it is translated.

## Performance

- Change detection: `OnPush`; classes from one `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Divider.ts`
  renders the account menu's separator between "Your projects" and "Sign out";
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: fixed hairline height; nothing loads.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given the account menu, when it opens, then an `hr.menu__divider` with `role="separator"` sits between "Your projects" and "Sign out". (L2-050)
- **AC-2** Given a section divider, when it renders, then it is an `hr.divider` showing one `--border-width-hairline` line in `--color-border-default` with `--space-6` above and below. (L2-051)
- **AC-3** Given a vertical divider between "Profile actions" and "Account actions" in a cluster, when it renders, then it has `aria-orientation="vertical"` and spans the cluster's row height. (L2-050)

### Keyboard and focus

- **AC-4** Given the account menu is open, when the member presses the Down arrow from "Your projects", then focus moves to "Sign out", never to the divider; and Tab never stops on any divider on the page. (L2-050)

### Screen readers

- **AC-5** Given each route with a divider, when axe-core runs, then there is no violation on the divider (no `aria-label` without a role that allows it, no separator in a list). (L2-050)

### Theming

- **AC-6** Given the dark theme, when a divider renders, then its line colour changes only through `--color-border-default`'s dark value, with no per-component dark-mode CSS. (L2-051)

### Responsive

- **AC-7** Given a cluster with a vertical divider at 320 px, when the row wraps, then nothing overflows horizontally. (L2-049)

### Performance

- **AC-8** Given a change to the divider, when the `Divider` perf-test scenario runs against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/divider/`:
  `divider.ts` (class `Divider`, selector `hr[bn-divider]`), `divider.css`; no
  template content (empty template). Export from `public-api.ts`.
- Host bindings: `[class]`, `[attr.role]`, `[attr.aria-orientation]`.
- Move `.divider`, `.divider--vertical` and `.menu__divider` into the
  component's styles, keeping names. [menu](menu.md) uses
  `<hr bn-divider variant="menu">` for its groups.
- Scenario: add `Divider.ts`; export from `scenarios/index.ts`.

## Decisions

- **D-1** *The mocks only use `.menu__divider`; who renders it?* The divider, through `variant="menu"`, so every separator in the product comes from one component; the class name stays `.menu__divider` for parity with the mocks. Raised with the lead so the menu CRD composes `bn-divider` rather than rendering its own `hr`.
- **D-2** *Should the "Labelled" divider be a feature?* No input for it. The design system's own *Content* rule says "Use text headings when a new section needs a name", and an `aria-label` on a separator is rarely announced; the consumer may still set one, which the native `hr` allows.
- **D-3** *`role="separator"` everywhere or only in menus?* Only in `role="menu"` containers, where the mock sets it explicitly; elsewhere the native `hr` already maps to `separator`.
- **D-4** *Does the line need 3:1 contrast?* No. It is decorative (the groups are also separated by space and headings), so WCAG 1.4.11 does not apply; the high-contrast preference still strengthens it through tokens.
