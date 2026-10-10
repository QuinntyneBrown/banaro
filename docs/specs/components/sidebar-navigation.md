# Sidebar navigation

| Field | Value |
|---|---|
| Selector | `bn-sidebar-navigation` |
| Library path | `frontend/projects/components/src/lib/sidebar-navigation/` |
| Status | planned |
| Traces to | L2-035, L2-036, L2-037, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`sidebar-navigation.html`](../../design-system/components/sidebar-navigation.html) |
| Source mocks | [`pages/settings/default`](../../mocks/pages/settings/default.html), [`privacy`](../../mocks/pages/settings/privacy.html), [`email`](../../mocks/pages/settings/email.html), [`loading`](../../mocks/pages/settings/loading.html), [`invalid`](../../mocks/pages/settings/invalid.html), [`submitting`](../../mocks/pages/settings/submitting.html), [`success`](../../mocks/pages/settings/success.html), [`error`](../../mocks/pages/settings/error.html); behind every [`dialogs/delete-account`](../../mocks/dialogs/delete-account/default.html) state |
| Rendering | [`sidebar-navigation.html`](sidebar-navigation.html) |

## Purpose and scope

Sidebar navigation moves between the sections of one area. In Banaro it is the settings navigation:
Account · Privacy · E-mail. From 992 px it is a vertical column beside the section's form; below
992 px it is a horizontal row above the form that scrolls sideways if its links do not fit. The
current section is marked with `aria-current="page"` and a dot.

Use the [top bar](top-bar.md) for the product's primary navigation, [tabs](tabs.md) for switching
panels inside one page without changing the URL, and the [drawer](drawer.md) for filters (the
design system mentions "directory refinements", but those are field choices, not navigation).

Out of scope:

- The settings layout grid (`.settings-layout`) and the section content (page).
- Saving, loading and error states of the sections (L2-035 to L2-037; the page shows them while the
  navigation stays as it is).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/settings/default`, `loading`, `invalid`, `submitting`, `success`, `error` | label "Settings"; items Account, Privacy, E-mail | three links | Account current | canvas, beside the form (LG) or above it |
| `pages/settings/privacy` | same | same | Privacy current | canvas |
| `pages/settings/email` | same | same | E-mail current | canvas |
| `dialogs/delete-account/*` | same, behind the dialog | same | Account current, inert | canvas |
| Design-system "grouped", "collapsible", "badges", "icons" specimens | `.sidebar-nav` with "Preferences", "Edit profile" | — | current, expanded | not used by any screen (D-2) |

## Anatomy

1. **Navigation** — `nav[aria-label=Settings]` (navigation landmark).
2. **List** — `ul.settings-nav`: no bullets, no padding; a row below LG, a column from LG.
3. **Link** — `li > a.nav__link`; the current one has `aria-current="page"` and the dot.

Host: `bn-sidebar-navigation` is `display: block`; it renders the `nav` inside.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | `aria-label` of the nav ("Settings"). Translatable. |
| `items` | `NavItem[]` | — | yes | Links in order. Current from `routerLinkActive` with exact matching, so `/settings` is current only on the Account section. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | Links navigate through the router. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | | Items arrive through `items`. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | — | Settings sections. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | links at least `--target-comfortable` | links `0 var(--space-3)` | `--font-weight-medium` body |

Width: row below LG fills its container; column from LG is the first column of
`.settings-layout` (`--size-settings-layout-grid-template-columns-37`).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default link | — | `--color-fg-muted` | — |
| Hover | `:hover` | `--color-fg-default` on `--color-bg-subtle` | — |
| Focus | `:focus-visible` | 2 px `--color-focus-ring` ring | — |
| Active (pressed) | `:active` | as hover | — |
| Current | `aria-current="page"` | `--color-fg-default` + `--color-accent` dot | "current page" |
| Overflowing row | links wider than the row (long translations) | Row scrolls sideways; links never wrap | Links stay in Tab order; focus scrolls the link into view |
| Inert | delete-account dialog open | Unchanged | Hidden by the dialog |

The design system's "disabled" and "expanded" states belong to its collapsible and badge specimens,
which the product does not use (D-2).

## Markup

```html
<!-- rendered: on /settings/privacy -->
<nav aria-label="Settings">
  <ul class="settings-nav">
    <li><a class="nav__link" href="/settings">Account</a></li>
    <li><a class="nav__link" href="/settings/privacy" aria-current="page">Privacy</a></li>
    <li><a class="nav__link" href="/settings/email">E-mail</a></li>
  </ul>
</nav>
```

```html
<!-- consumer: settings page -->
<bn-sidebar-navigation [label]="'settings.nav' | t" [items]="sections" />
```

The mock's inline `style="list-style:none;padding:0;margin:0"` moves into the component's styles.

## Design

- List: flex, gap `--space-1`, `overflow-x: auto` below LG; `flex-direction: column` from LG.
- Links (`.nav__link`, shared with the top bar's nav): flex, `align-items: center`, min height
  `--target-comfortable`, padding `0 var(--space-3)`, radius `--radius-md`, `--color-fg-muted`,
  `--font-weight-medium`, no underline, `white-space: nowrap`.
- Current dot: `--space-1` square, `--radius-full`, `--color-accent`, centred `--space-1` above the
  link's bottom.
- Motion: colour and background transitions `--duration-fast` / `--duration-base`
  `--ease-standard`.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Link | `--color-fg-muted` | resolved live | resolved live |
| Current and hover text | `--color-fg-default` | resolved live | resolved live |
| Hover fill | `--color-bg-subtle` | resolved live | resolved live |
| Current dot | `--color-accent` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Links |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Hovered link |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Current dot |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

## Responsive behaviour

- Below 992 px: one horizontal row above the form; if the links do not fit (long translations at
  320 px) the row scrolls sideways inside itself and the page does not.
- From 992 px (LG): a vertical column beside the form.
- Every link is at least 44 px tall at every width; at 200 % zoom the row scrolls rather than clips.

## Accessibility

### Role and pattern

A `nav` landmark named "Settings" holding a list of links; native semantics, no ARIA widget.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Account, Privacy, E-mail in order. |
| <kbd>Enter</kbd> | Follows the link; the section loads and the shell moves focus to `main`. |

### Focus

2 px `--color-focus-ring` ring; in the scrolling row a focused link scrolls into view.

### Labelling

Nav "Settings", distinct from "Primary" and "Footer". Current section by `aria-current="page"`, and
by a dot as well as colour (L2-050 AC7).

### Announcements

None.

### Motion

Transitions removed under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Stable nouns in this order: Account · Privacy · E-mail ("E-mail" with a hyphen, as everywhere in
  Banaro).
- Translatable inputs: `label`, `items[].label`. No data values.
- French ("Compte · Confidentialité · Courriel") fits the row at 360 px; longer labels scroll.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/SidebarNavigation.ts` renders the
  settings navigation with Account current; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: server-rendered with the current link; nothing loads late.
- Weight: `@angular/router` only.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara on `/settings`, when the page renders, then a navigation named "Settings" lists Account, Privacy and E-mail in that order, and Account has `aria-current="page"` and the dot. (L2-035)
- **AC-2** Given Amara chooses "Privacy", when `/settings/privacy` opens, then Privacy is the only link with `aria-current="page"`. (L2-036)
- **AC-3** Given Amara chooses "E-mail", when `/settings/email` opens, then E-mail is current and Account is not. (L2-037)

### States

- **AC-4** Given the Account section is saving or failed to load, when the page shows its submitting, error or loading state, then the navigation still shows all three links, still marks Account current, and stays usable. (L2-035)

### Keyboard and focus

- **AC-5** Given keyboard navigation, when each link receives focus, then it shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-6** Given `/settings` in both themes, when axe-core runs, then it reports no WCAG 2.2 A or AA violations, and the current section is conveyed by `aria-current` and the dot, not by colour alone. (L2-050)

### Theming

- **AC-7** Given the dark theme, when the navigation renders, then links measure at least 4.5:1 and the dot at least 3:1 against the canvas. (L2-050)
- **AC-8** Given the component's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-9** Given 360 px, when `/settings` renders, then the links sit in one row above the form, each at least 44 px tall, with no horizontal page scroll. (L2-049)
- **AC-10** Given 1280 px, when `/settings` renders, then the links form a column beside the form. (L2-049)

### Content

- **AC-11** Given the en-CA catalogue, when the navigation renders, then "Settings", "Account", "Privacy" and "E-mail" come from the catalogue. (L2-052)

### Performance

- **AC-12** Given a change to the component, when the perf test runs the `SidebarNavigation` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/sidebar-navigation/`: `sidebar-navigation.ts`,
  `.html`, `.css` (`SidebarNavigation`, selector `bn-sidebar-navigation`). Export from
  `public-api.ts`.
- Reuse `NavItem` from `top-bar`. The `.nav__link` rules are copied into this component's styles
  (encapsulated), not shared through a global stylesheet.
- Use `routerLinkActive` with `[routerLinkActiveOptions]="{ exact: true }"` and
  `ariaCurrentWhenActive="page"`.
- Breakpoint `media-up(LG)` (992 px).
- Routes `/settings`, `/settings/privacy`, `/settings/email` are the page's; the mocks show them as
  the `default`, `privacy` and `email` states.
- Add `SidebarNavigation.ts` to the perf-test scenarios and `index.ts`.

## Decisions

- **D-1** *`.sidebar-nav` (design system) or `.settings-nav` with `.nav__link` (mocks)?* The mocks'
  classes and look (dot, no fill): every settings mock uses them, e2e page objects locate by them,
  and visual parity compares against the mocks. The design system's accent-fill `.sidebar-nav` is
  not used.
- **D-2** *Grouped, collapsible, badge and icon variants?* Not built: no screen uses them and their
  specimens are identical apart from a `details` wrapper. Settings has three flat sections.
- **D-3** *Column breakpoint?* 992 px (LG), matching the other shell components, instead of the
  mocks' 64 rem.
- **D-4** *Exact or prefix matching for the current link?* Exact: `/settings` is a prefix of the
  other sections, so prefix matching would mark Account current everywhere.
- **D-5** *Wrap or scroll when the row is too long?* Scroll inside the row, as the design system
  states ("scrolls horizontally below 1024px"); wrapping would push the form down unevenly.
- **D-6** *The current dot in the column form sits centred under the full-width link, away from the
  word (as in the settings mocks at 1280 px). Keep it?* Yes, for visual parity with the mocks; the
  dot still marks the row and `aria-current` carries the meaning. A move under the label is a
  design-system change, raised with the lead.
