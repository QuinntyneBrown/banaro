# Progress bar

| Field | Value |
|---|---|
| Selector | `bn-progress-bar` |
| Library path | `frontend/projects/components/src/lib/progress-bar/` |
| Status | planned |
| Traces to | L2-008, L2-019, L2-020, L2-030, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`progress-bar.html`](../../design-system/components/progress-bar.html) |
| Source mocks | [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/empty`](../../mocks/pages/dashboard/empty.html), [`pages/builder-profile/own`](../../mocks/pages/builder-profile/own.html), [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html), [`pages/event-detail/going`](../../mocks/pages/event-detail/going.html), [`pages/event-detail/waitlist`](../../mocks/pages/event-detail/waitlist.html), [`dialogs/change-photo/busy`](../../mocks/dialogs/change-photo/busy.html) |
| Rendering | [`progress-bar.html`](progress-bar.html) |

## Purpose and scope

A progress bar shows how much of something known is done or used: how complete Amara's profile is
("Your profile is 80% complete"), how many of Fall Demo Night's 80 spots are taken, or how far a photo
upload has got. It is a thin rounded track with a sage fill, always next to text that says the same
thing in words.

Use a [spinner](spinner.md) when the amount done is unknown and the wait is short, and a
[skeleton](skeleton.md) while content loads. The onboarding steps use the stepper (`.stepper`), not a
progress bar.

Out of scope:

- The visible text beside the bar ("65 going · 15 spots left", "Your profile is 80% complete"); the
  page renders it.
- Computing the value (profile completeness per L2-030, spots per L2-020, upload bytes).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/dashboard/default`, `pages/builder-profile/own`, and the dashboard behind `account-banner/*`, `site-banner/*`, `dialogs/account-menu` | determinate, accent, `label="Profile completeness"`, value 80 of 100 | text above: "Your profile is 80% complete. Add what you are looking for in a co-founder." | default | aside card (`--color-bg-surface`) |
| `pages/dashboard/empty` | determinate, value 20 of 100 | "Your profile is 20% complete. Add your skills and what you are looking for." | default | aside card |
| `pages/event-detail/default` (and behind `rsvp-toast/info|warning|danger`) | determinate, `label="Spots taken"`, value 64 of 80 | text below: "64 going · 16 spots left" | default | RSVP panel |
| `pages/event-detail/going` (and behind `cancel-rsvp/*`, `rsvp-toast/success`) | determinate, value 65 of 80 | "65 going · 15 spots left" | default | RSVP panel |
| `pages/event-detail/waitlist` | determinate, value 80 of 80 (full) | "80 going · no spots left" | complete | RSVP panel |
| `dialogs/change-photo/busy` | determinate, `label="Uploading photo"`, value 60 of 100 | file name "amara-harvest-day.jpg", "1.2 MB" above | default (busy upload) | dialog surface |
| Design-system page | determinate, indeterminate, label + value, success, danger | "Uploading profile photo · 40%" | default, loading | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Track** — `div.progress`, `role="progressbar"`, carries the ARIA value attributes. Full width,
   `--space-2` high, fully rounded, `--color-border-default` fill, clips the bar.
2. **Fill** — `div.progress__bar`, width set inline as a percentage, `--color-accent` (or the tone's
   solid colour), rounded with the track.
3. **Text** — outside the component: the page's label or value line, before or after the bar.

Host: `bn-progress-bar` is `display: block` and renders the track inside it, so the page can place the
host in a grid or stack.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `number \| null` | `null` | no | Amount done, from 0 to `max`; clamped to that range. `null` is indeterminate. |
| `max` | `number` | `100` | no | Upper bound; written to `aria-valuemax`. Must be above 0. |
| `label` | `string` | — | one of `label` / `labelledBy` | `aria-label` ("Profile completeness", "Spots taken", "Uploading photo"). From the catalogue. |
| `labelledBy` | `string` | — | one of `label` / `labelledBy` | Id of visible text that names the bar; written to `aria-labelledby` (design-system pattern "Uploading profile photo · 40%"). Wins over `label`. |
| `valueText` | `string` | — | no | `aria-valuetext` when the number alone is unclear ("65 of 80 spots taken"). From the catalogue. |
| `tone` | `'accent' \| 'success' \| 'danger'` | `'accent'` | no | `success` adds `.progress--success`, `danger` adds `.progress--danger`. |

### Outputs

None. The bar is not interactive.

### Content slots

None.

The fill width is `round(value / max × 100)` per cent, set as an inline `width` on `.progress__bar`
(`style="width: 81%"`), exactly as the mocks write it.

## Variants and sizes

| Variant | Modifier | Fill | Use for |
|---|---|---|---|
| Accent (default) | none | `--color-accent` | Every product use: completeness, spots, upload |
| Success | `.progress--success` | `--color-success-solid` | A finished upload or a goal reached, when the page wants to say so |
| Danger | `.progress--danger` | `--color-danger-solid` | An upload that stopped with an error, shown beside the error text |

| Mode | Trigger | ARIA | Fill |
|---|---|---|---|
| Determinate | `value` is a number | `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow` | inline `width` |
| Indeterminate | `value` is `null` | `aria-busy="true"`, no `aria-valuenow` | `--size-progress-indeterminate` |

One size: height `--space-2`; width from the container.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Empty | `value` 0 | Track only | "0%" (or `valueText`) |
| Partial | 0 < `value` < `max` | Fill to the rounded percentage | `aria-valuenow` = `value`; percentage read by the screen reader, or `valueText` |
| Complete | `value` = `max` | Track fully filled ("80 going · no spots left") | `aria-valuenow` = `max` |
| Indeterminate (loading) | `value` `null` | Fill fixed at `--size-progress-indeterminate` from the start | `aria-busy="true"`, no value |
| Updated | `value` changes | Width changes at once | Not announced; the visible text beside it carries changes that matter |

No hover, focus, active or disabled states.

## Markup

```html
<!-- rendered: profile completeness (pages/dashboard/default) -->
<bn-progress-bar>
  <div aria-label="Profile completeness" aria-valuemax="100" aria-valuemin="0" aria-valuenow="80" class="progress" role="progressbar">
    <div class="progress__bar" style="width: 80%"></div>
  </div>
</bn-progress-bar>
```

```html
<!-- rendered: spots taken with value text (pages/event-detail/going) -->
<div aria-label="Spots taken" aria-valuemax="80" aria-valuemin="0" aria-valuenow="65" aria-valuetext="65 of 80 spots taken" class="progress" role="progressbar">
  <div class="progress__bar" style="width: 81%"></div>
</div>
```

```html
<!-- rendered: indeterminate, labelled by visible text (design-system page) -->
<p id="upload-label">Uploading profile photo</p>
<div aria-busy="true" aria-labelledby="upload-label" aria-valuemax="100" aria-valuemin="0" class="progress" role="progressbar">
  <div class="progress__bar"></div>
</div>
```

Success and danger add `.progress--success` / `.progress--danger` to `.progress`.

```html
<!-- consumer -->
<bn-progress-bar [value]="completeness()" [label]="'dashboard.profile.completeness' | translate" />
<bn-progress-bar [value]="event.going" [max]="event.capacity" [label]="'events.spotsTaken' | translate"
                 [valueText]="'events.spotsTakenOf' | translate: { going: event.going, capacity: event.capacity }" />
<bn-progress-bar [value]="uploadPercent()" [label]="'photo.uploading' | translate" />
```

The component writes the width inline, as the mocks do. Page objects locate by `[role="progressbar"]`, `.progress`, `.progress__bar` and the `aria-value*` attributes.

## Design

- Track: height `--space-2`; radius `--radius-full`; fill `--color-border-default`; `overflow: hidden`.
- Fill: `height: 100%`; `border-radius: inherit`; width inline (0 % when the value is 0); indeterminate
  width `--size-progress-indeterminate` (no inline width).
- No motion: width changes are immediate; the indeterminate fill does not move (see D-4).
- Spacing: none of its own; the RSVP meter puts `--space-2` between bar and text, the aside card
  `--space-4`.

Component tokens: none. The design system's code sample sets the width through a `bn-` prefixed
progress-value custom property instead; see D-1.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Track | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Fill (accent) | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Fill (success) | `--color-success-solid` | `--palette-sage-700` | `--palette-sage-300` |
| Fill (danger) | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-accent` | `--color-bg-surface` | 3:1 | Accent fill against the card it sits on (the boundary of the filled part) |
| `--color-accent` | `--color-border-default` | 3:1 | Fill against the unfilled track |
| `--color-success-solid` | `--color-bg-surface` | 3:1 | Success fill |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Danger fill |

The track itself is decorative: the fill's boundary and the text beside the bar carry the value. In
forced-colours mode the fill uses the system highlight colour so the filled part stays visible.

## Responsive behaviour

The bar is fluid: it takes its container's width at every breakpoint and keeps its height. At 320 px
it fits the RSVP panel and the aside card with no horizontal scroll (L2-049). It is not a touch
target.

## Accessibility

### Role and pattern

`role="progressbar"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` (determinate), or
`aria-busy="true"` without `aria-valuenow` (indeterminate). It is a passive indicator, not a slider or
a meter control.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on the bar. |

### Focus

Never focusable; never moves focus.

### Labelling

Every bar has an accessible name: `label` or `labelledBy`. A bar whose number is not a percentage of
something obvious sets `valueText` ("65 of 80 spots taken"). Visible text beside the bar repeats the
value in words, so the bar is never the only way to learn it (L2-050).

### Announcements

Value changes are not live; the visible text near the bar (or an alert or toast) announces outcomes.

### Motion

None.

## Content and internationalisation

- Name says what is measured: "Profile completeness", "Spots taken", "Uploading photo".
- Numbers follow L2-052 ("1,284"); percentages are whole numbers ("80%").
- Translatable: `label`, `valueText`. Data: `value`, `max`.

## Performance

- Change detection: `OnPush`; `value`, `max`, `tone` are signal inputs; the percentage and classes are
  `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ProgressBar.ts` renders Fall Demo
  Night's spots bar (65 of 80, "65 of 80 spots taken"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: fixed height; value changes never change layout.
- Weight: `@angular/core` only.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara's profile has four of five items, when the dashboard's profile card renders, then it shows `role="progressbar"` named "Profile completeness" with `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow="80"` and a fill 80% wide. (L2-030)
- **AC-2** Given a new member with one item filled, when the dashboard's empty state renders, then the bar has `aria-valuenow="20"` and a 20% fill. (L2-030)
- **AC-3** Given Fall Demo Night with 65 of 80 spots taken, when the RSVP panel renders, then the bar named "Spots taken" has `aria-valuemax="80"`, `aria-valuenow="65"`, `aria-valuetext="65 of 80 spots taken"` and a fill 81% wide, above the text "65 going · 15 spots left". (L2-019)
- **AC-4** Given the event is full, when the waitlist state renders, then the bar has `aria-valuenow="80"` of 80 and the fill covers the whole track. (L2-019)
- **AC-5** Given Amara RSVPs and the going count rises from 64 to 65, when the page updates, then the bar's `aria-valuenow` changes to 65 and the fill widens without any layout shift. (L2-020)
- **AC-6** Given the photo upload is 60% done, when the `change-photo` dialog is busy, then a bar named "Uploading photo" shows `aria-valuenow="60"` and a 60% fill. (L2-008)

### States

- **AC-7** Given `value` is `null`, when the bar renders, then it has `aria-busy="true"`, no `aria-valuenow`, and a fill `--size-progress-indeterminate` wide. (L2-050)
- **AC-8** Given `value` 95 with `max` 80, when the bar renders, then `aria-valuenow` is clamped to 80 and the fill does not exceed the track. (L2-019)

### Screen readers

- **AC-9** Given a bar with neither `label` nor `labelledBy`, when it renders in development, then the component reports a missing accessible name; with either set, axe reports no `aria-progressbar-name` violation. (L2-050)
- **AC-10** Given any bar, when the page is navigated with Tab, then the bar is never a tab stop. (L2-050)

### Theming

- **AC-11** Given the accent fill in light and dark, when measured, then it reaches at least 3:1 against the card surface and against the unfilled track. (L2-050)
- **AC-12** Given the theme switches, when the bar re-renders, then the track and fill colours change through `--color-border-default` and `--color-accent` alone. (L2-051)

### Responsive

- **AC-13** Given a 320 px viewport, when the RSVP panel renders, then the bar spans the panel's content width and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-14** Given a change to the progress bar, when the perf test runs `ProgressBar` against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/progress-bar/`, file `progress-bar.ts`, class
  `ProgressBar`, selector `bn-progress-bar`, style `progress-bar.css` with the `.progress` rules from
  `components.css` and `:host { display: block; }`.
- Bind the fill width with `[style.width.%]="percent()"`; omit it when indeterminate.
- In development mode, assert that `label` or `labelledBy` is set (AC-9).
- Export from `public-api.ts`; add `ProgressBar.ts` to the perf-test scenarios and `index.ts`.

## Decisions

- **D-1** *Inline `width` or the design system's progress-value custom property?* Inline `width`, as
  every mock writes it (`style="width: 81%"`). The design system's code sample sets a `bn-` prefixed
  custom property that `components.css` reads but never declares; both render the same width, and the
  mock markup is what the e2e visual-parity tests compare. An inline width also wins over that rule.
- **D-2** *How is the percentage rounded?* To a whole per cent, as the mocks do (65 of 80 → 81%). The
  exact value stays in `aria-valuenow`.
- **D-3** *Does the bar add `aria-valuetext`?* Only when given `valueText`. The spots bar passes "65 of
  80 spots taken" so a screen reader does not say "81%" for a count; profile completeness and upload
  read correctly as percentages.
- **D-4** *Does the indeterminate fill animate?* No. The design system defines a fixed
  `--size-progress-indeterminate` fill and no keyframes; `aria-busy` and the adjacent text carry the
  state. Adding motion would be a design-system change.
- **D-5** *Are the design-system modifiers `.progress--determinate` / `.progress--indeterminate`
  rendered?* No. They have no rules in `components.css` and the mocks do not use them; the mode is
  carried by `aria-busy` and `aria-valuenow`, which the CSS already keys on.
- **D-6** *Is the spots bar a `meter` rather than a `progressbar`?* It stays `progressbar`, as every
  mock marks it and the design system's "Do not use a decorative result meter as real progress" only
  warns against decoration; `valueText` gives the count its meaning.
