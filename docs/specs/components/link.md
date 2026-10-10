# Link

| Field | Value |
|---|---|
| Selector | `a[bn-link]`, `button[bn-link]` |
| Library path | `frontend/projects/components/src/lib/link/` |
| Status | planned |
| Traces to | L2-005, L2-034, L2-038, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`link.html`](../../design-system/components/link.html) |
| Source mocks | [`pages/join/default`](../../mocks/pages/join/default.html), [`dialogs/session-expired/invalid`](../../mocks/dialogs/session-expired/invalid.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/settings/default`](../../mocks/pages/settings/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/project-detail/default`](../../mocks/pages/project-detail/default.html), [`pages/code-of-conduct/default`](../../mocks/pages/code-of-conduct/default.html) |
| Rendering | [`link.html`](link.html) |

## Purpose and scope

Link takes a builder somewhere: a page, a profile, a project, the code of conduct, a help page.
It styles a native `<a href>` and adds the parts the design system asks for: the trailing arrow of
a standalone "All events" link, the leading icon of a project's web address, the danger tone, and
the "(opens in a new tab)" text of an external link. A `<button bn-link>` host exists for the one
case where an operation must read as a link in a sentence or a danger zone ("Delete my account",
which opens a dialog).

Use a [button](button.md) for an operation that looks like an action (including `variant="text"`
buttons such as "Sign in" and "Clear all"), the [breadcrumb](breadcrumb.md) for the parent path,
[tabs](tabs.md) for view switching, and [menu](menu.md) items inside a menu.

Out of scope:

- Links that are part of another block and carry that block's element class: `card__name`,
  `rows__title`, `project__name`, `event__title`, `person__name`, `comment__name`,
  `proj-head__by`, `notice__title`, `inbox__item`, `nav__link`, `matches-link`, `brand`, footer
  links, breadcrumb links, and the error summary's field links. They inherit the base `a` rule
  from the global foundation and are specified by their own CRDs.
- Router configuration and URL building.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/join` consent, `default`, `invalid`, `submitting` | `inline`, `external` | "code of conduct" + hidden "(opens in a new tab)"; "privacy policy" (same tab) | default | surface (form card) |
| `dialogs/session-expired/invalid` field error | `inline`, `external` | "reset it" + hidden "(opens in a new tab)" | default | dialog, inside danger field error text |
| `pages/sign-in` help and alternative, `pages/join`, `pages/forgot-password` | `inline` | "Forgot your password?"; "Join Banaro"; "Sign in"; "Back to sign in" | default | surface (auth card) |
| `pages/settings` password row | `inline` | "Change your password" | default | surface |
| `pages/settings` danger zone, `dialogs/delete-account` (page behind) | `danger`, `button` host (opens the dialog) | "Delete my account" | default | canvas |
| `pages/code-of-conduct`, `pages/privacy` prose | `inline` | "the contact page" | default | canvas (prose) |
| `pages/dashboard`, `pages/home`, `pages/events`, `pages/messages` section heads | `standalone`, `arrow` | "All matches", "All events", "All messages", "See all 312 projects", "Browse all 1,284 builders", "All 48 events in 2026" | default, hover (arrow nudges) | canvas |
| `pages/project-detail`, `dialogs/give-feedback`, `dialogs/offer-to-help` (page behind) | `standalone`, leading link icon | "psalter.example.ca", "github.com/dreyes/psalter" | default | surface (aside list) |
| `pages/messages` conversation header, `notifications/connection-banner` (page behind) | `inline` | "View profile" | default | surface |
| Design-system specimens only | `inline`, `standalone`, `external` | "View Psalter", "View Psalter (opens in new tab)" | hover, focus, active, disabled, visited | any |

## Anatomy

1. **Link** — the native host. `inline`: no class (the base `a` rule styles it), underlined in
   `--color-fg-link`. `standalone`: `.section__more`. `danger`: `.link-danger`.
2. **Leading icon (optional)** — `[slot=icon]`, `svg.icon.icon--sm`, `aria-hidden="true"`.
3. **Label** — the default slot; the accessible name.
4. **New-tab note (external only)** — `span.vh` with the `newTabLabel` text, inside the link after
   the label, visually hidden.
5. **Arrow (optional)** — `svg.icon.icon--sm` trailing arrow rendered by the component, nudging
   right on hover.

Host: the consumer's `<a>` or `<button>`. The component adds classes, `target`/`rel` for
external links, and renders parts 4 and 5; there is no wrapper.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'inline' \| 'standalone' \| 'danger'` | `'inline'` | no | `inline` adds no class; `standalone` adds `.section__more`; `danger` adds `.link-danger`. |
| `external` | `boolean` | `false` | no | `<a>` only: writes `target="_blank"` and `rel="noopener"` and renders the hidden new-tab note. |
| `newTabLabel` | `string` | `''` | when `external` | The hidden note, from the catalogue: " (opens in a new tab)". Dev mode throws when `external` is set without it. |
| `arrow` | `boolean` | `false` | no | Renders the trailing arrow (standalone section links). |
| `disabled` | `boolean` | `false` | no | `<a>`: removes `href`, adds `role="link"`, `aria-disabled="true"`, and leaves the tab order. `<button>`: native `disabled`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Native navigation (`href`/`routerLink`) or the native `click` of a `button[bn-link]` is the output. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text | The destination's name ("View Psalter", "Code of conduct"); never "click here" or a bare "Learn more". |
| `[slot=icon]` | One `svg.icon.icon--sm`, `aria-hidden="true"` | Before the label (standalone links only). |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Inline | none | Links inside sentences, help text, field errors and prose. Always underlined. |
| Standalone | `.section__more` | A link on its own line: "All events" with an arrow, a project's web address with a link icon. Label type, inline-flex with `--space-2` gap. |
| Danger | `.link-danger` | The entry point to an irreversible flow in a danger zone ("Delete my account"). |
| External (modifier of inline or standalone) | `target="_blank"` + `.vh` note | Only where the product must keep the current page (consent on join, "reset it" inside the session-expired dialog). |

One size: inline links take the surrounding font; standalone links use `--text-label`.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | `--color-fg-link`, underline `--border-width-hairline` thick, offset by the link underline-offset geometry token | Role link; name = label (+ new-tab note) |
| Hover | `:hover` (`data-state="hover"`) | `--color-fg-link-hover`; arrow nudges `--size-btn-translate-20` | — |
| Focus | `:focus-visible` | Global ring `--focus-ring-width` `--color-focus-ring`, `--radius-sm` corners | Focused |
| Active | `:active` | Same as hover | — |
| Visited | `:visited` | Same as default (D-2) | — |
| Disabled | `aria-disabled="true"`, no `href` | `--color-fg-disabled`, no underline change, `cursor: not-allowed` | "link, dimmed"; not focusable |
| Danger | `.link-danger` | `--color-danger-fg` text, hover keeps it | — (meaning carried by the words) |

## Markup

```html
<!-- rendered: inline -->
<p class="field__help"><a href="/forgot-password">Forgot your password?</a></p>
```

```html
<!-- rendered: external inline -->
<a href="/code-of-conduct" target="_blank" rel="noopener">code of conduct<span class="vh"> (opens in a new tab)</span></a>
```

```html
<!-- rendered: standalone with arrow; standalone with leading icon -->
<a class="section__more" href="/events">All events <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h15"/><path d="m13.5 6 6 6-6 6"/></svg></a>
<a class="section__more" href="https://psalter.example.ca"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>psalter.example.ca</a>
```

```html
<!-- rendered: danger on a button host; disabled anchor -->
<button type="button" class="link-danger">Delete my account</button>
<a role="link" aria-disabled="true">View Psalter</a>
```

```html
<!-- consumer -->
<a bn-link external [newTabLabel]="'common.newTab' | t" routerLink="/code-of-conduct">{{ 'join.consent.coc' | t }}</a>
<a bn-link variant="standalone" arrow routerLink="/events">{{ 'dashboard.events.all' | t }}</a>
<button bn-link variant="danger" type="button" (click)="openDeleteAccount()">{{ 'settings.delete.open' | t }}</button>
```

The classes `section__more`, `link-danger`, `vh` and the `target`/`rel` attributes are the e2e
contract.

## Design

- Inline: inherits font; underline thickness `--border-width-hairline`, underline offset from the
  link underline-offset geometry token.
- Standalone: `inline-flex`, `align-items: center`, gap `--space-2`, `--text-label`;
  start-aligned below 768 px, end-aligned in a section head from 768 px (the section head owns
  that placement).
- `button[bn-link]`: native button reset to look like the inline link — no border, no background,
  no padding, `font: inherit`, underlined, `cursor: pointer`.
- Arrow motion: translate `--size-btn-translate-20` over `--duration-base` with `--ease-standard`;
  colour over `--duration-fast`.
- Focus: global ring with `--radius-sm`.

Component tokens: none; colours come from the semantic link and danger tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Label | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Label, hover | `--color-fg-link-hover` | `--palette-sage-800` | `--palette-sage-200` |
| Danger label | `--color-danger-fg` | `--palette-lingon-700` | `--palette-lingon-300` |
| Disabled label | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Links on the page |
| `--color-fg-link` | `--color-bg-surface` | 4.5:1 | Links on cards and forms |
| `--color-fg-link-hover` | `--color-bg-surface` | 4.5:1 | Hovered links |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Danger link on the page |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | Danger link on a card |
| `--color-fg-link` | `--color-bg-surface-raised` | 4.5:1 | Link inside a dialog field error (D-7) |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus indicator |

Links in running text are distinguished by the underline, not by colour alone (WCAG 1.4.1).
Forced colours: links use `LinkText`; the focus ring uses `Highlight`.

## Responsive behaviour

- No layout change of its own; inline links wrap with their sentence, and long web addresses
  ("github.com/dreyes/psalter") break anywhere (`overflow-wrap: anywhere`) so they never cause
  horizontal scroll at 320 px.
- Standalone links have a minimum block size of `--target-comfortable` below 576 px so they
  meet 44 × 44 px; inline links in sentences are exempt (WCAG 2.5.8 inline exception).
- At 200 % zoom every link stays visible and operable.

## Accessibility

### Role and pattern

Native `<a href>` (role `link`), per the [link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/).
`button[bn-link]` is a native button (role `button`) because it performs an operation.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the link; disabled links are skipped. |
| <kbd>Enter</kbd> | Follows the link (opens a new tab for external links); activates a `button[bn-link]`. |
| <kbd>Space</kbd> | Scrolls the page on a link; activates a `button[bn-link]`. |

### Focus

Visible global focus ring; following a same-app link moves focus as the router's focus handling
defines; external links leave focus on the link in the original tab.

### Labelling

- The name is the visible label; external links add " (opens in a new tab)" to the name through
  the hidden note, so the name still starts with the visible text (WCAG 2.5.3).
- Repeated links must differ in text ("Read about Psalter", not "Read more").

### Announcements

None.

### Motion

Only the standalone arrow moves, and only under `prefers-reduced-motion: no-preference`.

## Content and internationalisation

- Name the destination: "View Psalter", "Code of conduct", "All 48 events in 2026". Sentence
  case. Numbers per L2-052 ("Browse all 1,284 builders").
- Translatable: the label and `newTabLabel` (en-CA " (opens in a new tab)"). Data values: web
  addresses and names.
- Longer translations wrap; standalone links wrap under their icon.

## Performance

- Change detection: `OnPush`, signal inputs, one `computed` for classes; no listeners except the
  click guard for disabled anchors.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Link.ts` renders the dashboard's
  standalone `<a bn-link variant="standalone" arrow>All events</a>` next to the join consent's
  external "code of conduct" link; iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the standalone link.
- Layout stability: inline; no reserved size needed.
- Weight: `@angular/core` only; `RouterLink` is applied by the consumer, not imported here.

## Acceptance criteria

### Rendering

- **AC-1** Given the sign-in page, when "Forgot your password?" renders, then it is an `<a>` with no class, underlined in `--color-fg-link`, with a contrast of at least 4.5:1 against the auth card. (L2-050)
- **AC-2** Given the join form, when the consent sentence renders, then "code of conduct" has `target="_blank"`, `rel="noopener"`, and the accessible name "code of conduct (opens in a new tab)", while "privacy policy" opens in the same tab. (L2-034)
- **AC-3** Given the session-expired dialog in its invalid state, when "reset it" renders inside the field error, then it opens `/forgot-password` in a new tab, its name ends "(opens in a new tab)", and it keeps the link colour and underline inside the `--color-danger-fg` error sentence. (L2-005)
- **AC-4** Given the dashboard events section, when "All events" renders, then it has the class `section__more`, a trailing `aria-hidden` arrow, and the accessible name "All events". (L2-050)
- **AC-5** Given the Psalter project page, when "github.com/dreyes/psalter" renders at 320 px, then the leading link icon is `aria-hidden`, the address wraps inside its column, and the page has no horizontal scroll. (L2-049)
- **AC-6** Given the settings page, when "Delete my account" renders, then it is a `<button type="button" class="link-danger">` in `--color-danger-fg` that opens the delete-account dialog, and focus returns to it when the dialog closes. (L2-038)

### States

- **AC-7** Given a link, when it is hovered, then its colour changes to `--color-fg-link-hover` and keeps at least 4.5:1, and a standalone arrow moves by `--size-btn-translate-20`. (L2-050)
- **AC-8** Given a disabled link "View Psalter", when it renders, then it has no `href`, `role="link"`, `aria-disabled="true"`, is skipped by Tab, and clicking it goes nowhere. (L2-050)

### Keyboard and focus

- **AC-9** Given any link, when it is reached with Tab, then it shows the 2 px `--color-focus-ring` ring with at least 3:1 contrast, and Enter follows it. (L2-050)

### Screen readers

- **AC-10** Given every rendered variant and state in both themes, when axe-core runs, then there are no violations (including `link-name` and `link-in-text-block`). (L2-050)

### Theming

- **AC-11** Given the dark theme, when inline, standalone and danger links render, then they resolve to `--palette-sage-300` and `--palette-lingon-300` through semantic tokens, with no component code for the theme. (L2-051)

### Content

- **AC-12** Given the app in en-CA, when an external link renders, then its hidden note comes from the catalogue and reads " (opens in a new tab)", and no link text is hard-coded in the component. (L2-052)

### Responsive

- **AC-13** Given a 360 px viewport, when the standalone "All messages" link is measured, then its target is at least 44 px high. (L2-049)

### Motion

- **AC-14** Given `prefers-reduced-motion: reduce`, when a standalone link is hovered, then the arrow does not move. (L2-050)

### Performance

- **AC-15** Given a change to the link, when the perf test runs `Link` and `DarkTheme` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/link/`; files `link.ts`, `link.html`, `link.css`;
  class `Link`; selector `a[bn-link], button[bn-link]`; export from `public-api.ts`.
- Template: `[slot=icon]`, default slot, the `.vh` note (`@if (external())`), the arrow
  (`@if (arrow())`); each slot declared once.
- The base `a` rule and `.vh` already live in the global foundation (`styles/base.css`); the
  component stylesheet adds only `.section__more`, `.link-danger`, the arrow motion, the
  `button[bn-link]` reset and the disabled colour.
- Add `common.newTab` to the en-CA catalogue.
- Add `Link.ts` to the perf-test scenarios and export it from `scenarios/index.ts`.

## Decisions

- **D-1** *What is the link's block class?* None for inline links: the mocks style a bare `<a>`
  through the base rule, and adding a class would break parity. Standalone and danger reuse the
  existing `.section__more` and `.link-danger` classes.
- **D-2** *Do visited links look different?* No. The design system's visited specimen has no rule
  of its own, and most links lead to living pages (profiles, projects) where "visited" carries no
  meaning.
- **D-3** *How is "Delete my account" built when it opens a dialog?* As `button[bn-link]`
  styled like the link: AGENTS.md requires button-triggered editing to open a CDK Dialog, and the
  design system says to use a button for operations; the mock's `<a>` points at the dialog mock
  only because mocks are static.
- **D-4** *Which links open a new tab?* Only those the mocks mark with `target="_blank"` (join
  consent, "reset it"), because L2-034 and L2-005 need the current form to survive. Project web
  addresses open in the same tab, as in the project mocks.
- **D-5** *How is a disabled link rendered?* Without `href`, with `role="link"` and
  `aria-disabled="true"`, as in the design-system specimen, but without the specimen's
  `tabindex="-1"` since an anchor without `href` is already not focusable.
- **D-6** *Standalone touch target?* At least 44 px high below 576 px (L2-049); the mocks' section
  links are 20 px of text, which fails the touch rule on phones.
- **D-7** *What colour does a link inside a field error take?* The link colour with its underline,
  as in the session-expired mock, not the error's danger colour; the underline separates it from
  the sentence. `--color-fg-link` on `--color-bg-surface-raised` is not yet a declared pair in
  `contrast-pairs.json`; the rendering page measures it in both themes and the design system
  should add the pair.
