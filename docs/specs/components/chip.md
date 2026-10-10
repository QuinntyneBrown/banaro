# Chip and tag

| Field | Value |
|---|---|
| Selector | `button[bn-chip]` (filter and removable chips), `li[bn-tag]`, `span[bn-tag]`, `p[bn-tag]` (static tags), `ul[bn-chip-list]` (the list that holds either) |
| Library path | `frontend/projects/components/src/lib/chip/` |
| Status | planned |
| Traces to | L2-006, L2-007, L2-009, L2-010, L2-011, L2-021, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`chip.html`](../../design-system/components/chip.html) |
| Source mocks | [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/directory/filtered`](../../mocks/pages/directory/filtered.html), [`pages/directory/no-results`](../../mocks/pages/directory/no-results.html), [`pages/directory/edge`](../../mocks/pages/directory/edge.html), [`pages/onboarding/skills`](../../mocks/pages/onboarding/skills.html), [`pages/profile-edit/default`](../../mocks/pages/profile-edit/default.html), [`pages/profile-edit/submitting`](../../mocks/pages/profile-edit/submitting.html), [`pages/matching-setup/default`](../../mocks/pages/matching-setup/default.html), [`pages/matching-setup/submitting`](../../mocks/pages/matching-setup/submitting.html), [`pages/events/default`](../../mocks/pages/events/default.html), [`pages/events/loading`](../../mocks/pages/events/loading.html), [`pages/projects/no-results`](../../mocks/pages/projects/no-results.html), [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/project-detail/own`](../../mocks/pages/project-detail/own.html), [`dialogs/give-feedback/default`](../../mocks/dialogs/give-feedback/default.html), [`dialogs/say-hello/default`](../../mocks/dialogs/say-hello/default.html), [`dialogs/block-builder/default`](../../mocks/dialogs/block-builder/default.html) |
| Rendering | [`chip.html`](chip.html) |

## Purpose and scope

Chips let a builder pick skills and narrow results: "Product strategy" in the directory's skill
facet, "Laravel" in matching setup, "All areas" on the events page. A pressed chip is a choice that
is on; a removable chip is a choice already applied ("Remove filter: Founders"). Tags are the
static, read-only cousins: a builder card's skills ("Laravel", "Angular", "PostgreSQL"), "Open to
co-founding" on the home page, a feedback type ("Question", "Encouragement") and the "Best match for
you" reason line.

Use a [checkbox](checkbox.md) when the choice sits in a vertical list with counts in a filter
group, a [button](button.md) for an action, and a [badge](badge.md) for a status such as "Online
now". The [search and filter toolbar](search-filter-toolbar.md) renders the active-filter chips with
this component.

Out of scope:

- The 12-skill limit, which chips are offered and what a press does to the results; the page owns
  the selection and passes `pressed` back in (L2-006, L2-010).
- Filter groups as `fieldset`/`legend`, the bottom sheet and "Apply" (drawer and checkbox CRDs).
- The skeleton pill (`.skeleton--pill`, skeleton CRD).
- The "Clear all" text button next to active filters ([button](button.md)).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/directory/*` skill facet (also behind `dialogs/say-hello/*`, `notifications/toast/*`) | `bn-chip` toggle with `count`, in `ul[bn-chip-list]` | "React" 203 … "Fundraising" 41 | pressed false, pressed true ("Product strategy" in `filtered`) | canvas sidebar / bottom sheet |
| `pages/directory/filtered`, `pages/directory/no-results` active filters | `bn-chip` remove, list label "Active filters" | "Founders", "Co-founding", "Product strategy"; "Designers", "Advising", "Oakville" | pressed (applied) | canvas |
| `pages/projects/no-results` active filters | `bn-chip` remove, list `layout="active-filters"` | "Stage: Launched", "Looking for: Advisor" | applied | canvas |
| `pages/onboarding/skills` | `bn-chip` toggle, list described by the skills help | "React" … "Fundraising"; "Figma", "Product strategy", "User research" pressed | pressed true/false | card |
| `pages/profile-edit/*` (also behind `dialogs/change-photo/*`, `dialogs/session-expired/*`) "Your skills" | `bn-chip` remove, list label "Your skills" | "Product strategy", "User research", "Figma" | applied, disabled (`submitting`) | surface |
| `pages/matching-setup/*` skills needed | `bn-chip` toggle | "Laravel", "Angular", "PostgreSQL" pressed; "Python" … "DevOps" | pressed, none pressed (`invalid`), disabled (`submitting`) | surface |
| `pages/events/default`, `pages/events/loading` area filter | `bn-chip` toggle, single choice, inside a `fieldset` with hidden legend "Filter by area" | "All areas", "Downtown", "Leslieville", "Liberty Village", "Markham" | pressed, disabled (`loading`) | canvas |
| builder cards everywhere (`pages/directory/*`, `dialogs/say-hello/*`, `dialogs/block-builder/*`, `dialogs/report/*`, `pages/builder-profile/*`) | `li[bn-tag]` neutral in `ul[bn-chip-list] layout="tags"` labelled "Skills" | "Laravel", "Angular", "PostgreSQL"; longest "Domain-driven design and event sourcing" (`edge`) | static | surface |
| `pages/home/default` featured builders | `span[bn-tag]` sage | "Open to co-founding", "Open to contributing", "Open to advising" | static | surface |
| `pages/project-detail/*`, `dialogs/give-feedback/*`, `dialogs/offer-to-help/*` feedback comments | `span[bn-tag]` neutral or sage | "Question", "Suggestion" (neutral); "Encouragement" (sage) | static | surface |
| `pages/directory/filtered`, `dialogs/say-hello/*`, `notifications/toast/*` match reason | `p[bn-tag]` sage with `[slot=icon]` | heart icon + "Best match for you: you're looking for a technical co-founder" | static | canvas |

## Anatomy

1. **Chip list** — `ul.chips` (interactive chips), `ul.tags` (static tags) or `ul.active-filters`
   (applied filters on the projects toolbar). Flex, wraps, gap `--space-2`. Each item is an `li`.
2. **Chip** — `button.chip`, `type="button"`. Pill shape, hairline border, label in
   `--text-body-sm`.
3. **Selected mark (pressed toggle only)** — leading `svg.icon.icon--sm` check, `aria-hidden="true"`.
4. **Label** — text node; the accessible name of a toggle chip.
5. **Count (optional)** — `span.chip__count`, tabular numerals, `--color-fg-subtle`.
6. **Remove mark (removable only)** — trailing `svg.icon.icon--sm` cross, `aria-hidden="true"`.
7. **Tag** — `.pill` on the host `li`, `span` or `p`; `.pill--sage` for the sage tone; optional
   leading icon.

Hosts: `button[bn-chip]` is the native button itself; the component sets its classes and ARIA and
renders the marks and count inside it. `[bn-tag]` is the native `li`, `span` or `p`. `ul[bn-chip-list]`
is the native list.

## API

### Inputs

`button[bn-chip]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `kind` | `'toggle' \| 'remove'` | `'toggle'` | no | `toggle` reflects `pressed` in `aria-pressed`; `remove` always renders `aria-pressed="true"`, the trailing cross and `aria-label` from `removeLabel`. |
| `pressed` | `boolean` | `false` | no | Toggle only. Sets `aria-pressed` and shows the leading check when true. Never changed by the chip itself; the page sets it from its state. |
| `count` | `string \| null` | `null` | no | Pre-formatted count ("1,284") rendered in `.chip__count`; omitted when null. |
| `removeLabel` | `string` | — | yes when `kind="remove"` | Full accessible name, starting with the action and containing the visible label: "Remove filter: Founders", "Remove skill: Figma". |

Native attributes stay on the host: `disabled`, `aria-describedby`, `id`. `type="button"` is set by
the component.

`[bn-tag]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tone` | `'neutral' \| 'sage'` | `'neutral'` | no | `sage` adds `.pill--sage`. |

`ul[bn-chip-list]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `layout` | `'chips' \| 'tags' \| 'active-filters'` | `'chips'` | no | Sets the list class `.chips`, `.tags` or `.active-filters`. |

The list keeps native `aria-label` ("Active filters", "Your skills", "Skills") and
`aria-describedby` on the host.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `pressedChange` | `boolean` (the requested new value) | A toggle chip is activated and is not disabled. |
| `removed` | `void` | A remove chip is activated and is not disabled. |

`[bn-tag]` and `ul[bn-chip-list]` have no outputs; they are not interactive.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default (chip) | text | The visible label: one skill, area or filter value. |
| default (tag) | text | The tag text. |
| `[slot=icon]` (tag) | one `svg.icon.icon--sm` | Optional leading icon, `aria-hidden="true"`; used by the match-reason line. |
| default (list) | `li` elements holding `button[bn-chip]` or being `li[bn-tag]` | One chip or tag per item. |

Each slot is declared once (AGENTS.md).

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Filter (toggle) | `button.chip[aria-pressed]` | Choosing skills, facets and areas; several or one at a time. |
| Filter with count | `button.chip` + `span.chip__count` | Directory skill facet: each option shows its count. |
| Removable | `button.chip[aria-pressed="true"][aria-label="Remove …"]` + cross | Applied filters and chosen skills that can be removed. |
| Static tag | `.pill` | Skills on cards and profiles, feedback types. |
| Sage tag | `.pill.pill--sage` | "Open to …", "Encouragement", the match reason. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| Chip (one size) | — | `--control-height-sm` visible; 44 px hit area | `--space-4` inline | `--text-body-sm` |
| Tag (one size) | — | `--size-ill-tags-and-status---------------------------min-height-6` minimum | `--space-3` inline | `--text-caption` |

The `.chip--sm` modifier exists in `components.css` with the same height; no product screen uses
it and the component does not expose it (D-6). Width comes from the label.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | `--color-bg-surface` fill, `--color-border-default` rule | "Laravel, toggle button, not pressed" |
| Hover | `:hover` | Rule becomes `--color-border-strong`, fill `--color-bg-subtle` | — |
| Focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` | — |
| Active | `:active` | Fill `--color-accent-subtle-hover` | — |
| Pressed | `aria-pressed="true"` | Fill `--color-accent-subtle`, rule `--color-accent`, label `--color-fg-accent`, leading check | "pressed" |
| Removable (applied) | `kind="remove"` | Pressed colours, trailing cross, no check | Name "Remove filter: Founders", "pressed" |
| Disabled | `disabled` | Fill `--color-bg-subtle`, label `--color-fg-disabled`, `cursor: not-allowed`; pressed chips keep the check | Removed from tab order; state still announced when browsed |
| Long label | text wider than the container | Label wraps inside the chip or tag; never truncated | Full label read |
| Static tag | `.pill` | `--color-bg-subtle` fill, `--color-fg-muted` text | Read as list item text |
| Sage tag | `.pill--sage` | `--color-accent-subtle` fill, `--color-fg-accent` text | Read as text |

There is no invalid state on a chip; when no skill is chosen (matching setup `invalid`), the error
belongs to the group's field error (form-field CRD).

## Markup

```html
<!-- rendered: toggle chips with counts in a list -->
<ul class="chips">
  <li><button type="button" class="chip" aria-pressed="false">React <span class="chip__count">203</span></button></li>
  <li><button type="button" class="chip" aria-pressed="true"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Product strategy <span class="chip__count">156</span></button></li>
</ul>
```

```html
<!-- rendered: removable chips -->
<ul class="chips" aria-label="Active filters">
  <li><button type="button" class="chip" aria-pressed="true" aria-label="Remove filter: Founders">Founders <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>
</ul>
<ul class="active-filters" aria-label="Active filters">
  <li><button type="button" class="chip" aria-pressed="true" aria-label="Remove filter: Stage: Launched">Stage: Launched <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>
</ul>
```

```html
<!-- rendered: disabled while submitting -->
<button type="button" class="chip" aria-pressed="true" disabled><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Laravel</button>
```

```html
<!-- rendered: static tags -->
<ul class="tags" aria-label="Skills"><li class="pill">Laravel</li><li class="pill">Angular</li><li class="pill">PostgreSQL</li></ul>
<span class="pill pill--sage">Open to co-founding</span>
<p class="pill pill--sage"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/></svg>Best match for you: you're looking for a technical co-founder</p>
```

```html
<!-- consumer -->
<ul bn-chip-list [attr.aria-describedby]="'skills-help'">
  @for (skill of catalogue(); track skill.id) {
    <li><button bn-chip [pressed]="selected().has(skill.id)" [disabled]="saving()" (pressedChange)="toggle(skill.id, $event)">{{ skill.name }}</button></li>
  }
</ul>
<ul bn-chip-list [attr.aria-label]="'directory.activeFilters' | t">
  @for (f of active(); track f.id) {
    <li><button bn-chip kind="remove" [removeLabel]="'directory.removeFilter' | t: { label: f.label }" (removed)="remove(f.id)">{{ f.label }}</button></li>
  }
</ul>
<ul bn-chip-list layout="tags" [attr.aria-label]="'builder.skills' | t">
  @for (s of builder.skills; track s) { <li bn-tag>{{ s }}</li> }
</ul>
```

The e2e page objects locate chips by `.chip`, `aria-pressed` and the accessible name, and tags by
`.pill`. The check and cross `svg` paths are free to change.

## Design

- Chip: `display: inline-flex`, gap `--space-2`, minimum height `--control-height-sm`, inline
  padding `--space-4`, radius `--radius-full`, rule `--border-width-hairline`.
- Hit area: a transparent `::after` extends the chip vertically to `--control-height-md` so the
  touch target is 44 × 44 CSS px without changing the 36 px visual (D-4).
- Label `--text-body-sm`; count `--text-caption` with `font-variant-numeric: tabular-nums`.
- Icons `--space-4` square (`.icon--sm`), `currentColor`.
- Lists: `.chips`, `.tags` and `.active-filters` wrap with gap `--space-2`.
- Tag: minimum height `--size-ill-tags-and-status---------------------------min-height-6`, inline padding `--space-3`,
  radius `--radius-full`, gap `--space-2`, `--text-caption`, `max-width: 100%`,
  `overflow-wrap: anywhere`.
- Motion: colour `--duration-fast`, background and border `--duration-base`, both
  `--ease-standard`, only under `prefers-reduced-motion: no-preference`.
- Forced colours: the chip keeps a `CanvasText` hairline (`components.css`).

The component declares no component tokens; surfaces never re-skin chips.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Chip fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Chip rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Chip label | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Hover rule | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Hover fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Active fill | `--color-accent-subtle-hover` | `--palette-sage-100` | `--palette-sage-900` |
| Pressed fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Pressed rule | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Pressed label | `--color-fg-accent` | `--palette-sage-700` | `--palette-sage-300` |
| Count | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Disabled label | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |
| Tag fill / text | `--color-bg-subtle` / `--color-fg-muted` | `--palette-oat-200` / `--palette-stone-700` | `--palette-night-800` / `--palette-night-200` |
| Sage tag fill / text | `--color-accent-subtle` / `--color-fg-accent` | `--palette-sage-50` / `--palette-sage-700` | `--palette-sage-950` / `--palette-sage-300` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Chip label |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Chip label on hover |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Pressed chip label, sage tag |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Count |
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | Neutral tag text |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

The disabled label is exempt from contrast minimums (WCAG 1.4.3 inactive components).

## Responsive behaviour

- The layout does not change across breakpoints: lists wrap onto as many lines as they need.
- Long labels wrap inside the chip or tag ("Domain-driven design and event sourcing" at 320 px);
  they are never truncated with an ellipsis.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every
  chip's touch target is at least 44 × 44 CSS px through the extended hit area, and adjacent hit
  areas do not overlap because rows are `--space-2` apart.

## Accessibility

### Role and pattern

Toggle chips are native `button` elements with `aria-pressed`, the
[APG button pattern (toggle)](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Removable chips are
buttons named by their action. Tags are plain text in list items. A group of toggle chips sits in a
`fieldset` with a `legend` provided by the page (L2-010).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous enabled chip; every chip is a tab stop. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Toggle: emits `pressedChange`. Remove: emits `removed`. |

### Focus

The ring is drawn on the button itself. When a removable chip is removed, the page moves focus to
the next chip in the list, or the previous one if it was last, or to the list's labelled heading or
"Clear all" when none remain; focus never falls to `body`.

### Labelling

- Toggle: the name is the visible label plus count ("React 203"); state from `aria-pressed`.
- Remove: `aria-label` from `removeLabel` ("Remove filter: Founders"), which contains the visible
  label (WCAG 2.5.3).
- Lists are labelled by the page (`aria-label="Active filters"`, `"Your skills"`, `"Skills"`) or
  described by help text (`aria-describedby="skills-help"`).

### Announcements

The chip announces nothing itself. Result counts that change after a press are announced by the
toolbar's live count ([search and filter toolbar](search-filter-toolbar.md)).

### Motion

Colour, background and border transitions run only under `prefers-reduced-motion: no-preference`;
with `reduce` the state changes instantly.

## Content and internationalisation

- Use skill names consistently and in sentence case: "React", "Laravel", "Product strategy",
  "User research", "Data/ML".
- Counts use thousands separators (L2-052): "1,284", "203". The page formats them and passes the
  string.
- Filter labels for the projects toolbar name the facet: "Stage: Launched", "Looking for: Advisor".
- Remove labels come from the catalogue with the value interpolated: "Remove filter: {label}",
  "Remove skill: {label}".
- Translatable inputs and slots: `removeLabel`, the list `aria-label`, interface labels such as
  "All areas" and "Open to co-founding". Data values: skill names, area names, counts.
- French labels run about 30 % longer; chips wrap rather than truncate, so nothing is lost.

## Performance

- Change detection: `OnPush`, signal inputs; `aria-pressed` and classes come from `computed`.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/Chip.ts` renders the directory
  skill facet, a `ul[bn-chip-list]` of 12 toggle chips "React 203" … "Fundraising 41" with "Product
  strategy" pressed; `Tag.ts` renders Daniel Reyes's skills ("Laravel", "Angular", "PostgreSQL") and
  "Open to co-founding". Iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep each at
  roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the skill facet; the builder card's scenario renders
  `Tag` inside every card.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: pressing a chip adds the check inside the chip; the chip grows by
  `--space-4` plus `--space-2` and the list may rewrap, which is user-initiated and not counted as
  layout shift. Counts are rendered with the chip, never filled in later.
- Weight: no dependencies beyond `@angular/core`.

## Acceptance criteria

### Rendering

- **AC-1** Given the directory skill facet, when it renders, then each skill is a `button.chip` with `type="button"`, `aria-pressed="false"` and a `.chip__count`, such as "React" with "203", inside a `ul.chips` that wraps. (L2-010)
- **AC-2** Given the directory skill facet with a skill counted at 1284 builders, when the page passes the count, then the chip shows "1,284" in `.chip__count`. (L2-052)
- **AC-3** Given Daniel Reyes's builder card, when it renders, then his skills "Laravel", "Angular" and "PostgreSQL" are `li.pill` items in a `ul.tags` labelled "Skills". (L2-009)
- **AC-4** Given a builder with no skills, when their card renders in the directory edge state, then no empty `ul.tags` is output. (L2-010)
- **AC-5** Given Esther Nguyen's profile, when the skills section renders, then each skill is a static `.pill` tag that is not focusable and has no button role. (L2-011)

### States

- **AC-6** Given the onboarding skills step with "Figma" not chosen, when Amara presses "Figma", then the chip emits `pressedChange` with `true`, and once the page sets `pressed`, the chip has `aria-pressed="true"`, the `--color-accent-subtle` fill and a leading check icon. (L2-006)
- **AC-7** Given matching setup with "Laravel" pressed, when Amara presses it again, then `pressedChange` emits `false` and the chip returns to `aria-pressed="false"` without the check. (L2-021)
- **AC-8** Given the "Your skills" list on profile edit, when Amara activates the chip named "Remove skill: Figma", then `removed` is emitted once and the page removes "Figma" from her skills. (L2-007)
- **AC-9** Given matching setup in the submitting state, when the chips render, then every chip has the native `disabled` attribute, pressed chips keep `aria-pressed="true"` and their check, and a press emits nothing. (L2-021)
- **AC-10** Given the directory edge state with the skill "Domain-driven design and event sourcing", when the card renders at 320 px, then the tag wraps onto a second line and shows the whole label without an ellipsis. (L2-010)

### Keyboard and focus

- **AC-11** Given the events area filter, when Amara tabs to "Leslieville" and presses Space, then `pressedChange` emits `true`, focus stays on "Leslieville", and the focus ring is a 2 px `--color-focus-ring` outline with at least 3:1 contrast. (L2-050)
- **AC-12** Given the active filters "Founders", "Co-founding" and "Product strategy", when Amara removes "Co-founding" with Enter, then focus moves to "Product strategy", not to the page body. (L2-050)

### Screen readers

- **AC-13** Given a pressed toggle chip "Product strategy", when a screen reader reaches it, then it is announced as a toggle button named "Product strategy 156" in the pressed state. (L2-010)
- **AC-14** Given the active filter chip "Founders", when a screen reader reaches it, then its name is "Remove filter: Founders" and the cross icon is `aria-hidden="true"`. (L2-050)
- **AC-15** Given a pressed toggle chip, when it is viewed without colour perception, then the selection is still shown by the leading check icon, not by colour alone. (L2-050)

### Theming

- **AC-16** Given the directory skill facet with "Product strategy" pressed, when the theme switches from light to dark, then the chip colours change through tokens only, the pressed label keeps at least 4.5:1 against its fill, and the neutral tag text keeps at least 4.5:1 against `--color-bg-subtle`. (L2-051)

### Responsive

- **AC-17** Given the onboarding skills step at 360 px on a touch device, when the chips are measured, then each chip's hit area is at least 44 × 44 CSS px, hit areas do not overlap, and the page has no horizontal scroll. (L2-049)

### Motion

- **AC-18** Given `prefers-reduced-motion: reduce`, when a chip is hovered or pressed, then its colours change without a transition. (L2-050)

### Performance

- **AC-19** Given the `Chip` and `Tag` perf-test scenarios, when the perf test runs against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- New folder `frontend/projects/components/src/lib/chip/` with `chip.ts` (`button[bn-chip]`,
  class `Chip`), `tag.ts` (`li[bn-tag], span[bn-tag], p[bn-tag]`, class `Tag`) and `chip-list.ts`
  (`ul[bn-chip-list]`, class `ChipList`), each with its own `.css` copied from the `.chip`,
  `.chip__count`, `.chips`, `.pill`, `.pill--sage`, `.tags` and `.active-filters` rules in
  `components.css`, plus the hit-area `::after` (D-4). Export all three from `public-api.ts`.
- Host bindings set `class`, `type="button"`, `aria-pressed` and `aria-label`; the `(click)`
  handler emits `pressedChange` or `removed` only when the host is not disabled.
- Add `Chip.ts` and `Tag.ts` scenarios and export them from `src/scenarios/index.ts` in the same
  change.
- Replace the hand-written `.chip` markup in the directory, onboarding, profile-edit,
  matching-setup, events and projects pages as each is built.

## Decisions

- **D-1** *The design-system page shows a removable tag as `.pill` with a separate `.btn--icon` "×";
  every mock uses one `button.chip` with a cross icon and an `aria-label` such as "Remove filter:
  Founders". Which wins?* The mocks' single-button chip. It is what every screen and the e2e visual
  baselines use, and one target is easier to hit than a small "×" inside a pill. Raised to the
  lead so the design-system page can catch up.
- **D-2** *The projects toolbar names its remove chips with a hidden "Remove filter" suffix
  ("Stage: Launched Remove filter"), the directory with an `aria-label` prefix. Which?* The prefix
  form, `aria-label="Remove filter: Stage: Launched"`, everywhere: one pattern for page objects,
  and the action is heard first.
- **D-3** *A pressed chip differs from an unpressed one only by colour in the mocks. L2-050 AC7
  requires a text or icon alternative.* A pressed toggle chip shows a leading check icon. This
  adds an icon the mocks do not draw, so it is raised to the lead; the mocks and visual baselines
  need the check added.
- **D-4** *The chip is 36 px tall; L2-049 asks for 44 × 44 px touch targets.* The visible chip
  stays at `--control-height-sm` to match the mocks, and a transparent `::after` extends the hit
  area to `--control-height-md`. Rows are `--space-2` apart, so neighbouring hit areas do not
  overlap.
- **D-5** *Removable chips carry `aria-pressed="true"` in the mocks. Is a pressed state right on a
  remove button?* Kept: the value is applied, pressing it un-applies it, and the styling hangs on
  `[aria-pressed="true"]`. The action is in the name, so the announcement reads "Remove filter:
  Founders, toggle button, pressed".
- **D-6** *The design-system page mentions small 36 px and medium 44 px chips; `components.css`
  defines `.chip--sm` at the same height as the default.* One size. No screen uses another, and
  the hit area already meets 44 px.
- **D-7** *Who formats counts?* The page passes a formatted string; the components library does
  not depend on the `api` library's formatters.
- **D-8** *Is `p.pill` (the "Best match for you" line) a tag?* Yes: a sage tag with a leading icon
  slot. It is static text that uses the `.pill` block.
- **D-9** *Do chips stay enabled while a form submits?* No. The mocks disable them in matching
  setup `submitting`, profile edit `submitting` and events `loading`, so the page sets `disabled`.
