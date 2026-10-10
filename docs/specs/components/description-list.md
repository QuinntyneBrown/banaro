# Description list

| Field | Value |
|---|---|
| Selector | `dl[bn-description-list]`, `div[bn-description-item]` |
| Library path | `frontend/projects/components/src/lib/description-list/` |
| Status | planned |
| Traces to | L2-011, L2-013, L2-021, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`description-list.html`](../../design-system/components/description-list.html) |
| Source mocks | [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/builder-profile/own`](../../mocks/pages/builder-profile/own.html), [`pages/project-detail/default`](../../mocks/pages/project-detail/default.html), [`pages/project-detail/own`](../../mocks/pages/project-detail/own.html), [`pages/matching/default`](../../mocks/pages/matching/default.html), [`pages/matching-setup/success`](../../mocks/pages/matching-setup/success.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html) |
| Rendering | [`description-list.html`](description-list.html) |

## Purpose and scope

A description list presents read-only facts as term and value pairs: a
builder's "At a glance" (Open to, Neighbourhood, Distance, Member since), a
project's (Stage, Looking for, Built with, Licence, Updated), and a member's
matching search (Building, Looking for, Within, Monday e-mail). Terms are small
uppercase overlines; values are body text. Facts are never shown as disabled
inputs.

The card-internal fact grids are separate blocks: `.card__facts` belongs to
[card](card.md) and `.project__facts` to [project-card](project-card.md).

Out of scope:

- The panel around the facts (`.aside-card` and its title): the page or
  [container-grid-stack](container-grid-stack.md).
- Formatting dates, distances and counts: the page, with the `api` library's
  formatters.
- Deciding which facts a viewer may see (L2-011 AC4, L2-036): the page omits
  hidden items.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/builder-profile/default`, `sparse` (and behind `dialogs/block-builder/*`, `dialogs/report/*`) "At a glance" | 4 items | Open to "Co-founding", Neighbourhood "Mississauga", Distance "26.9 km from Leslieville", Member since "March 2026" | default | aside surface |
| `pages/builder-profile/own` | 3 items (no Distance to yourself) | Open to, Neighbourhood "Leslieville", Member since "January 2026" | item omitted | aside surface |
| `pages/project-detail/default` (and behind `dialogs/give-feedback/*`, `dialogs/offer-to-help/*`) | 5 items | Stage "1,900 beta users", Looking for "Contributors (open source)", Built with "Laravel, Angular, PostgreSQL", Licence "MIT", Updated "6 Oct 2026" | default | aside surface |
| `pages/project-detail/own` | 4 items | Stage "Beta · 6 food banks", Looking for "Technical co-founder", Visibility "Everyone on Banaro", Updated "2 Oct 2026" | default | aside surface |
| `pages/project-detail/empty` | 4 items | Stage "Design", Looking for "Engineering co-founder", Built with "Figma, paper prototypes", Shared "9 Oct 2026" | default | aside surface |
| `pages/matching/*` (and behind `dialogs/pass-suggestion/*`, `dialogs/pause-matching/*`) "Your search" | 4 items | Building "Harvest, volunteer scheduling for GTA food banks", Looking for "A technical co-founder", Within "40 km of Leslieville", Monday e-mail "On" | default | aside surface |
| `pages/matching-setup/success` | 3 items | Looking for, Skills "Laravel, Angular, PostgreSQL", Within | default | canvas |
| `pages/dashboard/*` (and behind `dialogs/account-menu/*`, banners) "Your project" | 3 items | Stage "Beta · 6 food banks", Looking for "Technical co-founder", Feedback "23 comments" | default | aside surface |
| Design system *Horizontal* and *Vertical* | 2 items | Building "Psalter · Scripture memorisation", Open to "Co-founding" | default | surface |

## Anatomy

1. **List** — `dl.facts` (the host `dl[bn-description-list]`): a grid with
   `--space-4` between items.
2. **Item** — `div` (the host `div[bn-description-item]`): a grid with
   `--space-1` between term and value.
3. **Term** — `dt`: `--text-overline`, `--letter-spacing-wide`, uppercase by
   CSS, `--color-fg-subtle`.
4. **Description** — `dd`: `--text-body`, `--color-fg-default`; the projected
   value (text, or text with an inline link).

Host: attribute components on the native `dl` and `div`, because a `dl` may
only contain `div`, `dt` and `dd`; a custom element inside it would break the
list's semantics.

## API

### Inputs — `dl[bn-description-list]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| None | — | — | — | Adds the `facts` class only. |

### Inputs — `div[bn-description-item]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `term` | `string` | — | yes | The term ("Open to"), sentence case in source; CSS uppercases it. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Read-only. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default (item) | text or phrasing content (an inline `a`) | Rendered inside the single `dd`. Never an input or a button. |
| default (list) | `div[bn-description-item]` only | Items in display order; a missing or hidden value omits its whole item. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Stacked (design system *Vertical*) | `.facts` | Every product use: one item per row, term above value. |
| Horizontal (design system *Horizontal*) | `.facts` | Renders identically to stacked; see D-1. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | none | term `--text-overline`, value `--text-body` |

Width comes from the container (the aside card or the narrow column).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Term over value | "term, value" pairs |
| Item omitted | value missing or hidden by privacy | Item not rendered; gaps close | Pair not announced |
| Long value | long project or skill names | Wraps; never truncated | Full text |
| Hover, focus, active, disabled | not supported | — | Passive; an inline link follows the link rules |

## Markup

```html
<!-- rendered -->
<dl bn-description-list class="facts">
  <div bn-description-item><dt>Open to</dt><dd>Co-founding</dd></div>
  <div bn-description-item><dt>Neighbourhood</dt><dd>Mississauga</dd></div>
  <div bn-description-item><dt>Distance</dt><dd>27 km from Leslieville</dd></div>
  <div bn-description-item><dt>Member since</dt><dd>March 2026</dd></div>
</dl>
```

```html
<!-- consumer -->
<dl bn-description-list>
  <div bn-description-item [term]="t('profile.glance.openTo')">{{ profile.openTo }}</div>
  @if (profile.distance; as distance) {
    <div bn-description-item [term]="t('profile.glance.distance')">{{ distance }}</div>
  }
</dl>
```

## Design

- List: grid, gap `--space-4`.
- Item: grid, gap `--space-1`.
- Term: `--text-overline`, `--letter-spacing-wide`, `text-transform:
  uppercase`, `--color-fg-subtle`.
- Value: `--text-body`, `overflow-wrap: anywhere` for long names.
- No motion, no elevation.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Semantic tokens directly. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Term | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Value | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Inline link | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Term in an aside card |
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Value in an aside card |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Term on the page (matching setup) |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Value on the page |

## Responsive behaviour

- No breakpoints. The list keeps one item per row at every width; values wrap.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices (an inline link in a value is the only target and takes its line height plus padding from the link rules).

## Accessibility

### Role and pattern

Native `dl` with `div`-grouped `dt`/`dd` pairs. Terms and values stay adjacent;
pairing is never by visual alignment alone.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches only links inside values; the list itself takes no focus. |

### Focus

Inline links show the shared ring.

### Labelling

The panel heading ("At a glance", "Your search") names the group; the list
needs no label of its own.

### Announcements

None.

### Motion

None.

## Content and internationalisation

- Terms: short nouns, sentence case in the catalogue ("Open to", "Member
  since", "Monday e-mail"); uppercase is only CSS, so translations stay
  readable.
- Values follow L2-052: dates "6 Oct 2026", months "March 2026", distances
  "5.8 km" (one decimal under 10 km, none above), counts "1,900 beta users".
- Lists of skills are comma-separated in their saved order.
- Translatable: every term and fixed value ("On", "Everyone on Banaro").
  Data: names, places, dates, counts.

## Performance

- Change detection: `OnPush`; the item template is static apart from the term.
- Perf-test scenarios:
  `frontend/projects/perf-test/src/scenarios/DescriptionList.ts` renders
  Daniel Reyes's "At a glance" (Open to "Co-founding", Neighbourhood
  "Mississauga", Distance "27 km from Leslieville", Member since "March
  2026"); `frontend/projects/perf-test/src/scenarios/DescriptionItem.ts`
  renders the single Psalter "Licence" "MIT" pair; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: no async content; the page's skeleton reserves the panel.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given Daniel Reyes's profile, when "At a glance" renders, then a `dl.facts` shows the four pairs Open to "Co-founding", Neighbourhood "Mississauga", Distance "27 km from Leslieville" and Member since "March 2026", in that order. (L2-011)
- **AC-2** Given Daniel Reyes has hidden his neighbourhood, when another member views his profile, then neither the "Neighbourhood" term nor its value is in the page, and no empty item remains. (L2-011)
- **AC-3** Given the Psalter project page, when its facts render, then they show Stage "1,900 beta users", Looking for "Contributors (open source)", Built with "Laravel, Angular, PostgreSQL", Licence "MIT" and Updated "6 Oct 2026". (L2-013)
- **AC-4** Given Amara's saved matching search, when the success state of matching setup renders, then the facts show Looking for "A technical co-founder", Skills "Laravel, Angular, PostgreSQL" and Within "40 km of Leslieville". (L2-021)
- **AC-5** Given a project updated on 6 October 2026, when the "Updated" value renders, then it reads "6 Oct 2026". (L2-052)

### Screen readers

- **AC-6** Given "At a glance", when a screen reader reads it, then it announces a description list whose pairs read term then value ("Open to, Co-founding"), and each `dt`/`dd` pair sits in its own `div` inside the `dl`, so axe-core reports no definition-list violation. (L2-050)

### Theming

- **AC-7** Given the light theme, when the facts render in an aside card, then terms and values each measure at least 4.5:1 against `--color-bg-surface`. (L2-050)
- **AC-8** Given the dark theme, when the same facts render, then their colours change only through the theme's token values and both still measure at least 4.5:1. (L2-051)

### Responsive

- **AC-9** Given the value "Harvest, volunteer scheduling for GTA food banks" at 320 px, when "Your search" renders, then the value wraps in full and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-10** Given a change to the description list, when the `DescriptionList` and `DescriptionItem` perf-test scenarios run against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/description-list/`:
  `description-list.ts` (class `DescriptionList`, selector
  `dl[bn-description-list]`, host class `facts`, template `<ng-content />`)
  and `description-item.ts` (class `DescriptionItem`, selector
  `div[bn-description-item]`, template `<dt>{{ term() }}</dt><dd><ng-content /></dd>`);
  export both from `public-api.ts`.
- Move the `.facts` rules into the component styles; add `overflow-wrap:
  anywhere` to `dd` (D-3).
- Scenarios: add `DescriptionList.ts` and `DescriptionItem.ts`; export from
  `scenarios/index.ts`.

## Decisions

- **D-1** *How does the design system's "Horizontal" variant differ from "Vertical"?* It does not: both specimens use identical `.facts` markup and `components.css` has no horizontal modifier. The CRD specifies one stacked layout; the two-column fact grids in cards are `.card__facts` and `.project__facts`, owned by those components.
- **D-2** *Does an empty value show a placeholder?* No. A missing or hidden value omits the whole item (L2-011 AC4 says hidden fields are absent; L2-011 AC2 says the sparse profile shows only populated sections). The card's "No project listed" is specific to the card.
- **D-3** *What happens to long values?* They wrap with `overflow-wrap: anywhere`, matching the design system's "Wrap long skill names without cutting them"; `components.css` does not yet set it on `.facts dd`, so the component adds it.
- **D-4** *The mocks write "26.9 km from Leslieville"; L2-052 AC3 says no decimal above 10 km. Which?* L2-052: "27 km from Leslieville". The value is formatted by the page, so the component is unaffected, but the criteria quote the requirement. Raised with the lead as a mock-versus-L2 conflict across the cast's distances.
