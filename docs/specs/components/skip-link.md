# Skip link

| Field | Value |
|---|---|
| Selector | `bn-skip-link` |
| Library path | `frontend/projects/components/src/lib/skip-link/` |
| Status | built |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`skip-link.html`](../../design-system/components/skip-link.html) |
| Source mocks | Every screen, for example [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/directory/default`](../../mocks/pages/directory/default.html), [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`notifications/site-banner/info`](../../mocks/notifications/site-banner/info.html) |
| Rendering | [`skip-link.html`](skip-link.html) |

## Purpose and scope

The skip link lets keyboard and switch users jump past the banners, header and primary navigation
straight to the page's `main` landmark. It is the first focusable element of every page in both
applications (`banaro` and `admin`), hidden until it receives focus.

It is not a general in-page link: use a [link](link.md) to jump to a section, and the error
summary's own links to jump to fields.

Out of scope:

- Placing it first in the document and giving `main` its `id`: the application shell does that
  (`app.html` renders `<bn-skip-link>` before the banners and the header).
- Focus management after a route change (the shell's router focus handling).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| All 49 screens and 196 states in `docs/mocks` (pages, dialogs over pages, notifications over pages) | `href="#main"`, target `main#main` | "Skip to content" | hidden (default), focused (on first Tab) | canvas, above the site banner and top bar |
| `banaro` application shell (`app.html`) | `label` from `common.skipToContent`, default target `main` | "Skip to content" | hidden, focused | canvas |
| `admin` application shell | same as `banaro` | "Skip to content" | hidden, focused | canvas |

Dialog states render the skip link on the inert page behind the dialog; while a modal dialog is
open the skip link is inert with the page (CDK Dialog), so focus stays in the dialog.

## Anatomy

1. **Link** — `a.skip-link` with `href="#{target}"`. Pill, inverse colours, positioned at the
   top-left of the viewport, translated off-screen until focused.
2. **Target** — the page's `main` element (`id="main"`), outside the component; it receives
   `tabindex="-1"` the first time the link is used.

Host: `bn-skip-link` is `display: contents`; it renders only the `<a>`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Visible text and accessible name; from the catalogue (`common.skipToContent` = "Skip to content"). |
| `target` | `string` | `'main'` | no | The `id` of the element to focus. Written into `href` as `#{target}`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | The link only moves focus; nothing outside needs to react. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | The label is an input so it can never be empty. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | — | The only variant; the design system's "focused" specimen is the same element in its focus state. |

One size. Padding `--space-3` × `--space-5`; width comes from the label.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Hidden (default) | not focused | Translated `-200%` upwards, out of view; still rendered (not `display: none`) | In the accessibility tree as a link named "Skip to content"; first in reading order |
| Focused | `:focus` | Translated into view at `--space-4` from the top and left, inverse pill, focus ring around it | Announced as "Skip to content, link" |
| Hover | `:hover` while focused | No change of its own | — |
| Activated | click or <kbd>Enter</kbd> | Link hides again as focus leaves it | Focus lands on `main`; the reader starts reading the main content |
| Target missing | no element with the target id | Link behaves as a plain same-page anchor (no error) | — |

There is no disabled, busy or error state: the link is always available.

## Markup

```html
<!-- rendered -->
<bn-skip-link><a class="skip-link" href="#main">Skip to content</a></bn-skip-link>
...
<main id="main" tabindex="-1">…</main>   <!-- tabindex added on first use -->
```

```html
<!-- consumer (application shell) -->
<bn-skip-link [label]="'common.skipToContent' | t" />
<bn-connection-banner />
<bn-header />
<main id="main"><router-outlet /></main>
```

The class `skip-link`, the `href` and the visible text are the e2e contract.

## Design

- Position: `absolute`, `left` and `top` `--space-4`, layer `--z-tooltip` so nothing (sticky top
  bar `--z-sticky`, site banner, popover `--z-popover`) covers it.
- Shape: padding `--space-3` `--space-5`, `--radius-full`.
- Type: `--text-label`.
- Hidden by `translate: 0 -200%`; focused `translate: 0 0`. No transition.
- Focus ring from the global `:focus-visible` rule (`--focus-ring-width`, `--color-focus-ring`,
  `--focus-ring-offset`).

Component tokens: none; the link reads semantic tokens directly.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill | `--color-bg-inverse` | `--palette-ink-900` | `--palette-night-50` |
| Label | `--color-fg-inverse` | `--palette-birch-50` | `--palette-night-950` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-inverse` | `--color-bg-inverse` | 4.5:1 | Label on the pill |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring against the page |

Forced colours: the link draws in system `LinkText` on `Canvas` with the `Highlight` focus ring.

## Responsive behaviour

- Same position and size at every breakpoint.
- At 320 px the focused pill ("Skip to content", or a translation about 30 % longer) fits within
  the viewport minus `--space-4` on each side and wraps rather than overflowing; at 200 % zoom it
  stays fully visible when focused.
- The link is excluded from the 44 × 44 px target audit while off-screen; when focused it is a
  keyboard target, not a touch target.

## Accessibility

### Role and pattern

Native `<a href>` (role `link`), per the
[landmark regions practice](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) and WCAG
2.4.1 Bypass Blocks.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> (first press after load) | Focuses and reveals the link. |
| <kbd>Enter</kbd> | Moves focus to the target; the next <kbd>Tab</kbd> reaches the first focusable element inside `main`. |
| <kbd>Tab</kbd> (again, without activating) | Moves on to the site banner or top bar; the link hides. |

### Focus

The link moves focus programmatically to the target (adding `tabindex="-1"` if needed) and
prevents the default anchor navigation, so the router does not change the URL and the page does
not scroll past content above `main`. The target shows no focus ring (it is not interactive).

### Labelling

The name is the visible label, "Skip to content".

### Announcements

None beyond the focus move; screen readers announce the `main` landmark on arrival.

### Motion

The link appears and disappears without animation in every motion setting.

## Content and internationalisation

- Label: "Skip to content" (en-CA catalogue key `common.skipToContent`). Sentence case, no
  punctuation.
- Translatable: `label`. Data values: none.

## Performance

- Change detection: `OnPush`, signal inputs, no subscriptions; the click handler reads the DOM
  only when activated.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/SkipLink.ts` renders
  `<bn-skip-link label="Skip to content" />`; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: absolutely positioned, so showing it never moves the page (CLS 0).
- Weight: `DOCUMENT` from `@angular/common` only.

## Acceptance criteria

### Rendering

- **AC-1** Given any route in `routes.manifest.ts`, when the page has loaded and the visitor presses Tab once, then focus is on the link "Skip to content", which is the first focusable element of the document. (L2-050)
- **AC-2** Given the directory page has loaded, when nothing is focused, then the skip link is in the accessibility tree as a link named "Skip to content" and is not visible in the viewport. (L2-050)
- **AC-3** Given the skip link is focused, when it renders, then it sits `--space-4` from the top-left corner, above the top bar and any site banner, with `--color-fg-inverse` text on `--color-bg-inverse` at a contrast of at least 4.5:1. (L2-050)

### Keyboard and focus

- **AC-4** Given the skip link is focused on the builder profile of Daniel Reyes, when Enter is pressed, then focus moves to `main#main`, which has `tabindex="-1"`, the URL does not change, and the next Tab focuses the first link inside `main` ("Builders" in the breadcrumb). (L2-050)
- **AC-5** Given the skip link is focused, when it is measured, then it shows a `--focus-ring-width` ring in `--color-focus-ring` with at least 3:1 contrast against the page. (L2-050)
- **AC-6** Given the skip link is focused, when Tab is pressed without activating it, then focus moves to the next control in the header and the link is hidden again. (L2-050)
- **AC-7** Given a page whose target id is missing, when the link is activated, then no script error occurs and the browser follows the `#main` anchor. (L2-050)
- **AC-8** Given the admin application, when any admin route loads and Tab is pressed once, then "Skip to content" is focused and Enter moves focus to its `main`. (L2-050)

### Screen readers

- **AC-9** Given each route and theme, when axe-core runs with the skip link focused and unfocused, then there are no violations (including `bypass` and `skip-link`). (L2-050)

### Theming

- **AC-10** Given the dark theme, when the skip link is focused, then its fill resolves to `--palette-night-50` and its label to `--palette-night-950` through the semantic tokens, with no component code for the theme. (L2-051)

### Content

- **AC-11** Given the app in en-CA, when the shell renders, then the label comes from the catalogue key `common.skipToContent` and reads "Skip to content". (L2-052)

### Responsive

- **AC-12** Given a 320 px viewport, when the skip link is focused, then it is fully visible and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-13** Given a change to the skip link, when the perf test runs `SkipLink` against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

The built component matches this CRD except:

- The admin application does not render it yet; its shell must add `<bn-skip-link>` before its
  header with the same catalogue key.
- Add a forced-colours rule (`LinkText` on `Canvas`) and `overflow-wrap: anywhere` with
  `max-width: calc(100vw - 2 * var(--space-4))` so a long translation wraps at 320 px.
- When the target is missing the component already falls back to the native anchor; keep that
  behaviour and add no console output.

## Decisions

- **D-1** *Does the target keep `tabindex="-1"` after focus?* Yes. Removing it on blur adds work
  for no benefit, and `main` must stay programmatically focusable for later uses.
- **D-2** *Should the link change the URL hash?* No. The default navigation is prevented so the
  Angular router never sees `#main` and history gains no entry; the mocks' `href="#main"` stays
  for the no-script and missing-target fallback.
- **D-3** *Is there an entrance animation?* No. The design system defines none, and a moving
  focus target would only delay the user.
- **D-4** *Which layer does it use?* `--z-tooltip`, the highest layer, so the design system's
  "do not conceal the focused link under a fixed header" rule holds against the sticky top bar,
  banners and popovers.
- **D-5** *What happens while a modal dialog is open?* The page behind the dialog, including the
  skip link, is inert, as L2-050 requires focus to stay in the dialog.
