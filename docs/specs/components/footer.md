# Footer

| Field | Value |
|---|---|
| Selector | `bn-footer` |
| Library path | `frontend/projects/components/src/lib/footer/` |
| Status | built |
| Traces to | L2-039, L2-041, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`footer.html`](../../design-system/components/footer.html) |
| Source mocks | Every page, dialog and notification mock (196 files), for example [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html) |
| Rendering | [`footer.html`](footer.html) |

## Purpose and scope

The footer closes every page with the same three things: the maker line "Made in Toronto. © 2026
Banaro.", the footer navigation (About · Code of conduct · Privacy · Contact), and Banaro's land
acknowledgement. It is identical for visitors and members, so legal and help links are always in
the same place.

It is passive: no states of its own beyond its links. Use the [top bar](top-bar.md) for primary
navigation and the page itself for page-specific links.

Out of scope:

- The content of the linked pages (L2-034, L2-040, L2-041).
- Link styles outside the footer ([link](link.md)).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every page, dialog and notification mock (196 files), signed in and out | maker line, four links, land acknowledgement | "Made in Toronto. © 2026 Banaro."; About, Code of conduct, Privacy, Contact; "Banaro gathers on the traditional territory of many nations, including the Mississaugas of the Credit, the Anishnabeg, the Chippewa, the Haudenosaunee and the Wendat peoples." | default; links default, hover, focus | canvas; inert behind dialogs |
| Design-system "simple" and "multi column" specimens | same content | same | default | canvas |

## Anatomy

1. **Container** — `footer.footer#footer` (contentinfo landmark): top hairline, top margin
   `--layout-section-gap`.
2. **Grid** — `div.wrap.footer__grid`: one column, two from LG.
3. **Maker line** — `p.footer__made`.
4. **Footer navigation** — `nav[aria-label=Footer]` with `ul.footer__links` of links.
5. **Land acknowledgement (optional)** — `p.footer__land`, spanning both columns from LG.

Host: `bn-footer` is `display: block`; it renders the `footer` element inside.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `made` | `string` | — | yes | Maker line. Translatable; the year is a catalogue parameter. |
| `navLabel` | `string` | — | yes | `aria-label` of the nav ("Footer"). Translatable. |
| `links` | `NavItem[]` | `[]` | no | In order: About, Code of conduct, Privacy, Contact. Empty hides the nav. |
| `land` | `string \| null` | `null` | no | Land acknowledgement. `null` omits the paragraph. Translatable. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | The footer only links; navigation is the router's. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | | All copy arrives through inputs. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | — | Every page. |

The design system's "simple" and "multi column" specimens are the same markup at different widths;
the two-column layout is the responsive rule below (D-1).

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | block `--space-16` top, `--space-24` bottom; inline from `.wrap` | maker and land `--text-body-sm`; links body |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Links `--color-fg-muted`, no underline | contentinfo landmark with a "Footer" navigation |
| Link hover | `:hover` | `--color-fg-default`, underlined | — |
| Link focus | `:focus-visible` | 2 px `--color-focus-ring` ring | — |
| Link current | `aria-current="page"` on the current page's link | `--color-fg-default`, underlined | "current page" |
| Without land acknowledgement | `land = null` | Paragraph absent | — |
| Inert | a dialog is open | Unchanged | Hidden by the dialog |

## Markup

```html
<!-- rendered -->
<footer class="footer" id="footer">
  <div class="wrap footer__grid">
    <p class="footer__made">Made in Toronto. © 2026 Banaro.</p>
    <nav aria-label="Footer">
      <ul class="footer__links">
        <li><a href="/about">About</a></li>
        <li><a href="/code-of-conduct">Code of conduct</a></li>
        <li><a href="/privacy" aria-current="page">Privacy</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
    <p class="footer__land">Banaro gathers on the traditional territory of many nations, including the Mississaugas of the Credit, the Anishnabeg, the Chippewa, the Haudenosaunee and the Wendat peoples.</p>
  </div>
</footer>
```

```html
<!-- consumer: shell -->
<bn-footer [made]="'shell.made' | t: { year: 2026 }" [navLabel]="'shell.footer' | t"
           [links]="footerLinks()" [land]="'shell.land' | t" />
```

## Design

- Container: margin-top `--layout-section-gap`; padding-block `--space-16` `--space-24`; top rule
  `--border-width-hairline` `--color-border-default`.
- Grid gap `--space-10`; from LG two equal columns, `align-items: start`, land spanning both.
- Links: flex, wrap, gap `--space-2` `--space-6`; each link at least `--target-comfortable` tall
  below 576 px (D-2).
- Land: max width `--size-footer-land-max-width-17`, `--text-body-sm`, `--color-fg-subtle`.
- Maker: `--text-body-sm`, `--color-fg-muted`.
- Motion: link colour transition `--duration-fast` `--ease-standard`.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Maker line, links | `--color-fg-muted` | resolved live | resolved live |
| Link hover | `--color-fg-default` | resolved live | resolved live |
| Land acknowledgement | `--color-fg-subtle` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Links and maker line |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Land acknowledgement |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

## Responsive behaviour

- Below 992 px: one column — maker line, links (wrapping), land acknowledgement.
- From 992 px (LG): maker line and links side by side; land acknowledgement below, across both.
- At 320 px links wrap onto two lines, nothing scrolls horizontally, and each link's target is at
  least 44 × 44 CSS px; at 200 % zoom everything stays available.

## Accessibility

### Role and pattern

Native `footer` (contentinfo landmark, L2-050 AC5) with a `nav` named "Footer"; plain links.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Visits About, Code of conduct, Privacy, Contact in order. |
| <kbd>Enter</kbd> | Follows the link. |

### Focus

2 px `--color-focus-ring` ring at `--focus-ring-offset`; the footer never moves focus.

### Labelling

Nav named "Footer" so it differs from "Primary". The current page's link has `aria-current="page"`
and an underline, not only a colour change.

### Announcements

None.

### Motion

The colour transition is removed under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Maker line: "Made in Toronto. © 2026 Banaro." (year from the catalogue parameter).
- Links in this order and wording: About · Code of conduct · Privacy · Contact.
- Land acknowledgement exactly as in the cast; never shortened and never an image.
- Translatable inputs: `made`, `navLabel`, `links[].label`, `land`. No data values.
- French runs about 30 % longer; links wrap and the land paragraph keeps its measure.

## Performance

- Change detection: `OnPush`, signal inputs; no computed work.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Footer.ts` (exists) renders the
  maker line, the four links and the land acknowledgement; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: text only, server-rendered; nothing loads late.
- Weight: `@angular/router` (`RouterLink`, `RouterLinkActive`) only.

## Acceptance criteria

### Rendering

- **AC-1** Given a visitor on `/`, when the page renders, then the footer shows "Made in Toronto. © 2026 Banaro.", links About, Code of conduct, Privacy and Contact in that order, and the land acknowledgement. (L2-039)
- **AC-2** Given the footer, when Amara activates "Privacy", then `/privacy` opens and the footer's "Privacy" link has `aria-current="page"`. (L2-041)

### Keyboard and focus

- **AC-3** Given keyboard navigation, when each footer link receives focus, then it shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast against the canvas. (L2-050)

### Screen readers

- **AC-4** Given any page, when its landmarks are listed, then there is one `contentinfo` landmark containing a navigation named "Footer", and axe-core reports no violations for it in either theme. (L2-050)

### Theming

- **AC-5** Given the dark theme, when the footer renders, then links measure at least 4.5:1 and the land acknowledgement at least 4.5:1 against the canvas. (L2-050)
- **AC-6** Given the footer's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-7** Given 360 px, when the footer renders, then it is one column, links wrap without horizontal scroll, and each link target is at least 44 px tall. (L2-049)
- **AC-8** Given 1280 px, when the footer renders, then the maker line and links sit side by side and the land acknowledgement spans below them. (L2-049)

### Content

- **AC-9** Given the en-CA catalogue, when the footer renders, then every string comes from the catalogue. (L2-052)

### Performance

- **AC-10** Given a change to the footer, when the perf test runs the `Footer` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

Gaps between the built `bn-footer` and this CRD:

- `land` is `input.required`; make it `input<string | null>(null)` and omit the paragraph when null.
- Links lack `routerLinkActive` with `ariaCurrentWhenActive="page"` and a current style.
- Two-column rule uses `@media (min-width: 64rem)`; use `media-up(LG)` (992 px).
- Below 576 px links need a `--target-comfortable` minimum block size (inline-flex, centred).
- `NavItem` is imported from `top-bar`; keep it there (shared type).

## Decisions

- **D-1** *Simple or multi-column variant?* One footer; the design system's two specimens are the
  same markup, and the column change is a breakpoint rule.
- **D-2** *Are the inline footer links 44 px targets?* Yes below 576 px (L2-049 AC1); above it the
  design system's 24 px minimum holds, so the desktop look is unchanged.
- **D-3** *Breakpoint for two columns?* 992 px (LG), matching the other shell components; the
  mock's 64 rem is not an L2 class.
- **D-4** *Mark the current page in the footer?* Yes, with `aria-current="page"` and an underline;
  the mocks show no current state but the shell does it for every navigation, and it costs no layout.
