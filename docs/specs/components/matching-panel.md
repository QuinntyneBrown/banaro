# Matching invitation

| Field | Value |
|---|---|
| Selector | `bn-matching-panel` (the invitation panel) and `article[bn-match-suggestion]` (a suggestion card); one CRD because the design-system page "Matching invitation" defines both |
| Library path | `frontend/projects/components/src/lib/matching-panel/` |
| Status | planned |
| Traces to | L2-021, L2-022, L2-023, L2-030, L2-039, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`matching-panel.html`](../../design-system/components/matching-panel.html) (page "Matching invitation") |
| Source mocks | [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/home/partial`](../../mocks/pages/home/partial.html), [`pages/home/error`](../../mocks/pages/home/error.html), [`pages/matching/empty`](../../mocks/pages/matching/empty.html), [`pages/matching/default`](../../mocks/pages/matching/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/partial`](../../mocks/pages/dashboard/partial.html), [`pages/dashboard/empty`](../../mocks/pages/dashboard/empty.html), [`dialogs/pass-suggestion/default`](../../mocks/dialogs/pass-suggestion/default.html), [`dialogs/pause-matching/default`](../../mocks/dialogs/pause-matching/default.html), [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`notifications/site-banner/info`](../../mocks/notifications/site-banner/info.html), [`notifications/account-banner/info`](../../mocks/notifications/account-banner/info.html) |
| Rendering | [`matching-panel.html`](matching-panel.html) |

## Purpose and scope

Co-founder matching has two faces, and this CRD covers both.

- The **invitation panel** is the warm birch panel with a whisper of wood grain that asks
  "Looking for a co-founder?", explains that Banaro suggests three builders nearby every Monday,
  offers "Start matching", and shows "A Monday, for example" with three sample builders.
- The **suggestion card** is one of "Your three this week": the builder's photo, name and role,
  the match score in words ("94% match"), why they match, and the two decisions — "Say hello"
  and "Pass". The same card shape carries the dashboard's "Start here" steps for a new member.

Use the [card](card.md) for other framed content, the [person](person.md) row for a builder in
the directory, and the [alert](alert.md) for the paused and reviewed states of `/matching`.

Out of scope:

- Generating, ranking and counting suggestions (L2-022), and which three to show (L2-030 AC6).
- The `say-hello`, `pass-suggestion` and `pause-matching` [dialog](dialog.md)s the actions open.
- `/matching` paused (an [alert](alert.md) with "Resume matching") and reviewed (an alert plus a
  `ul.rows` list): page markup.
- The page section around the panel (`section.section#matching`) and its heading id wiring.
- Loading: the pages render [skeleton](skeleton.md) cards in the suggestion list.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/home/default`, `loading`, `partial`, `error` | panel | eyebrow "Co-founder matching"; `h2#matching-title` "Looking for a co-founder?"; text; action button "Start matching" (primary lg); note "96 co-founder matches so far"; examples Daniel Reyes 26.9 km, Noah Fischer 5.8 km, Caleb Morgan 17.8 km, "Mon" | default | birch panel on canvas |
| `pages/matching/empty` | panel | eyebrow "Not set up yet"; action link "Start matching" to `/matching/setup`; note "It takes about two minutes." | default | panel |
| `pages/matching/default`; also behind `dialogs/pass-suggestion/*` and `dialogs/pause-matching/*` | suggestion, avatar 48 | Daniel Reyes "Full-stack engineer · Mississauga · 26.9 km", 94%; reason with lead "Why you match."; actions "Say hello" (primary sm), "Pass" (quiet sm) | default | surface card in `ul.stack` |
| `pages/dashboard/default`, `pages/dashboard/partial` | suggestion, avatar 40 | Daniel 94%, Noah 88%, Ruth 76%; meta without distance; reason without lead; "Say hello", "Pass" | default | surface card |
| Behind `dialogs/account-menu/default`, `notifications/site-banner/*`, `notifications/account-banner/*` (dashboard copy) | suggestion | as dashboard, but the second action reads "Not now" (D-5) | default | surface |
| `pages/dashboard/empty` "Start here" (3 cards) | suggestion, `kind="step"` | icon tile (person, calendar, heart); "Complete your profile" / "Step 1 of 3"; reason; one primary action | default | surface |
| Design system "Paused" | panel with paused copy | consumer copy only (D-4) | — | panel |

Every row is buildable with the API below.

## Anatomy

**Panel** (`bn-matching-panel`, host `display: block`, renders the div):

1. **Panel** — `div.panel.grain.match`. Birch fill, `--radius-xl`, grain mask behind the content
   (`::before`, `z-index: -1`).
2. **Pitch column** — unclassed `div`: `p.eyebrow`, `h2.match__title`, `p.match__text`,
   `div.match__actions` (projected action + `span.muted` note).
3. **Example column** — `div.match__week`: `p.eyebrow`, `ul.match__week` of `li.match__slot`
   (40 px photo with empty `alt`, `p` with `strong` name and role · distance, `span.match__day`).

**Suggestion** (`article[bn-match-suggestion]`, host `article.suggest`):

1. **Who** — `div.dialog__who`: avatar (`img.avatar`, 40 or 48) or step icon
   (`span.dialog__icon`), the name block (`h3.rows__title` with link, `p.rows__meta`), and the
   score `p.card__match` (`strong` "94%" + "match") pushed right.
2. **Why** — `p.suggest__why`, optional `strong` lead.
3. **Actions** — `div.cluster` with the projected buttons.

## API

### `bn-matching-panel` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `eyebrow` | `string` | — | yes | "Co-founder matching", "Not set up yet". |
| `heading` | `string` | — | yes | "Looking for a co-founder?" in `h2.match__title`. |
| `headingId` | `string` | `'matching-title'` | no | The page's section uses it for `aria-labelledby`. |
| `text` | `string` | — | yes | The promise line. |
| `note` | `string \| null` | `null` | no | Muted note beside the action. |
| `exampleEyebrow` | `string` | — | yes | "A Monday, for example". |
| `examples` | `MatchExample[]` (`{ name; role; distance; day; photo: string \| null; initials: string; tone }`) | `[]` | no | Up to three; a slot without a photo shows initials on a tile. |

Slot: `[slot=action]` — one `a[bn-button]` or `button[bn-button]`, primary, lg.

### `bn-match-suggestion` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `kind` | `'match' \| 'step'` | `'match'` | no | `step` replaces the avatar with `span.dialog__icon` and hides the score. |
| `name` | `string` | — | yes | Builder name, or the step title ("Complete your profile"). |
| `href` | `string \| null` | `null` | no | Builder profile link on the name. |
| `headingId` | `string` | — | yes | `id` of the `h3`; the host's `aria-labelledby`. |
| `meta` | `string` | — | yes | "Full-stack engineer · Mississauga · 26.9 km" or "Step 1 of 3". |
| `photo` | `string \| null` | `null` | no | Avatar URL; null shows initials from `initials` and `tone`. |
| `initials` / `tone` | `string` / `'sage' \| 'clay' \| 'fjord' \| 'oat'` | `''` / `'sage'` | no | For builders without a photo. |
| `avatarSize` | `40 \| 48` | `40` | no | 48 on `/matching`. |
| `icon` | `'person' \| 'calendar' \| 'heart'` | `'person'` | no | Step icon. |
| `score` | `number \| null` | `null` | no | Integer 0–100; renders `strong` "{score}%" and `scoreLabel`. |
| `scoreLabel` | `string` | `'match'` (from catalogue) | no | The word after the number. |
| `reasonLead` | `string \| null` | `null` | no | Bold lead, "Why you match." |
| `reason` | `string` | — | yes | The reasons for the match or the step's explanation. |

Slot: `[slot=actions]` — up to two buttons ("Say hello", "Pass") or one step action.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Actions are projected buttons; dialogs open from the page. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Invitation panel | `div.panel.grain.match` | Home page and `/matching` before setup. |
| Suggestion | `article.suggest` | One weekly suggestion. |
| Step | `article.suggest` with `span.dialog__icon` | Dashboard "Start here" steps. |

| Size | Where | Avatar |
|---|---|---|
| Comfortable | `/matching` | 48 px (`--space-12`) |
| Default | dashboard | 40 px (`--space-10`) |

The panel is one size: `--space-12` `--space-6` padding below 1024 px, `--space-20` `--space-16`
from 1024 px, where it becomes two columns (1.2fr / 1fr).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Panel default | — | Birch fill, grain at `--grain-opacity` | Heading names the section |
| Example slot hover | `:hover` (no-preference motion) | Slot transitions per the shared rule; no lift | — |
| Suggestion default | — | Surface card; score in accent display type | Article named by the builder |
| Builder without photo | `photo` null | Initials tile in the tone | Initials `aria-hidden`; name in heading |
| Contacted / passed | page state | The card leaves the list (L2-024) or the page shows its reviewed list | Page announces |
| Action busy | projected button | Button busy | `aria-busy` |
| Long name or reason | data | Wraps; the score stays right-aligned at its natural width | — |

## Markup

```html
<!-- rendered: panel (pages/home/default) -->
<bn-matching-panel>
  <div class="panel grain match">
    <div>
      <p class="eyebrow">Co-founder matching</p>
      <h2 class="match__title" id="matching-title">Looking for a co-founder?</h2>
      <p class="match__text">Tell us what you're building and who you need. We'll suggest three builders nearby every Monday.</p>
      <div class="match__actions"><button type="button" class="btn btn--primary btn--lg">Start matching</button><span class="muted">96 co-founder matches so far</span></div>
    </div>
    <div class="match__week">
      <p class="eyebrow">A Monday, for example</p>
      <ul class="match__week">
        <li class="match__slot"><img src="/media/daniel-reyes.jpg" width="40" height="40" alt="" loading="lazy"><p><strong>Daniel Reyes</strong>Full-stack engineer · 26.9 km</p><span class="match__day">Mon</span></li>
        …
      </ul>
    </div>
  </div>
</bn-matching-panel>
```

The mock's inline `style="margin-top: var(--space-5)"` on the title and `font: var(--text-body-sm)`
on the note move into component CSS; the inner `ul.match__week` gap is `--space-3`.

```html
<!-- rendered: suggestion (pages/matching/default) -->
<article class="suggest" aria-labelledby="s-daniel-reyes">
  <div class="dialog__who">
    <img class="avatar" src="/media/daniel-reyes.jpg" width="48" height="48" alt="">
    <div><h3 class="rows__title" id="s-daniel-reyes"><a href="/builders/daniel-reyes">Daniel Reyes</a></h3><p class="rows__meta">Full-stack engineer · Mississauga · 26.9 km</p></div>
    <p class="card__match"><strong>94%</strong>match</p>
  </div>
  <p class="suggest__why"><strong>Why you match.</strong> Laravel and Angular, building Psalter after hours and open to co-founding. He is the technical half Harvest is missing.</p>
  <div class="cluster"><a class="btn btn--primary btn--sm" href="…/say-hello">Say hello</a><a class="btn btn--quiet btn--sm" href="…/pass">Pass</a></div>
</article>
```

```html
<!-- rendered: step (pages/dashboard/empty) -->
<article class="suggest" aria-labelledby="st-1"><div class="dialog__who"><span class="dialog__icon"><svg class="icon" aria-hidden="true">…person…</svg></span><div><h3 class="rows__title" id="st-1">Complete your profile</h3><p class="rows__meta">Step 1 of 3</p></div></div><p class="suggest__why">Add your skills, your neighbourhood and a photo. Builders look at profiles before they reply.</p><div class="cluster"><a class="btn btn--primary btn--sm" href="/profile/edit">Complete profile</a></div></article>
```

```html
<!-- consumer -->
<ul class="stack">
  @for (s of suggestions(); track s.id) {
    <li><article bn-match-suggestion [headingId]="'s-' + s.slug" [name]="s.name" [href]="'/builders/' + s.slug"
        [meta]="s | bnSuggestionMeta" [photo]="s.photo" [avatarSize]="48" [score]="s.score"
        [reasonLead]="'matching.why' | t" [reason]="s.reason">
      <button bn-button variant="primary" size="sm" slot="actions" (click)="sayHello(s)">{{ 'matching.hello' | t }}</button>
      <button bn-button variant="quiet" size="sm" slot="actions" (click)="pass(s)">{{ 'matching.pass' | t }}</button>
    </article></li>
  }
</ul>
```

The mock's `style="margin-left:auto"` on `.card__match` becomes component CSS.

## Design

- Panel: `--radius-xl`, fill `--color-panel-birch`, padding above; `.match` grid gap
  `--space-10` (`--space-20` and two columns from 1024 px).
- Grain: `::before` with `--color-grain` at `--grain-opacity` through the turbulence mask sized
  `--size-grain-mask-size-13` × `--size-grain-mask-size-14`; never carries text.
- Title `--text-h2`, `--letter-spacing-tight`, max width `--size-match-title-max-width-15`, top
  margin `--space-5`. Text `--color-fg-muted`, max width `--size-match-text-max-width-16`.
  Actions: gap `--space-4`, top margin `--space-8`; note `--text-body-sm`.
- Example slot: three columns, gap `--space-4`, padding `--space-3` `--space-4`, `--radius-md`,
  fill `--color-bg-surface`, `--shadow-1`; photo `--space-10`, `--radius-sm`; name
  `--font-weight-semibold`; day `--text-caption` `--color-fg-subtle`.
- Suggestion: gap `--space-4`, padding `--space-6`, `--radius-lg`, surface fill, hairline. Who row
  gap `--space-4`; avatar `--radius-md`; name `--text-h4`; meta `--text-body-sm`
  `--color-fg-muted`. Score: number in `--font-family-display` `--font-size-xl`
  `--font-weight-light` `--color-fg-accent`, tabular; label `--text-caption` `--color-fg-subtle`.
  Why: padding `--space-4`, `--radius-md`, `--color-bg-subtle`, `--text-body-sm`.
- Step icon tile: `.dialog__icon`, `--color-accent-subtle` with `--color-fg-accent`.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel fill | `--color-panel-birch` | `--palette-clay-100` | `--palette-night-850` |
| Grain | `--color-grain` | `--palette-clay-500` | `--palette-clay-300` |
| Panel text | `--color-fg-default` / `--color-fg-muted` | ink / stone | night 50 / 200 |
| Example slot | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Suggestion card | `--color-bg-surface`, `--color-border-default` | birch / oat 300 | night 900 / 700 |
| Score number | `--color-fg-accent` | `--palette-sage-700` | `--palette-sage-300` |
| Why well | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Step icon | `--color-fg-accent` on `--color-accent-subtle` | sage 700 on sage 50 | sage 300 on sage 950 |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-panel-birch` | 4.5:1 | Panel title |
| `--color-fg-muted` | `--color-panel-birch` | 4.5:1 | Panel text and note |
| `--color-fg-subtle` | `--color-panel-birch` | 4.5:1 | Eyebrows on the panel |
| `--color-fg-accent` | `--color-bg-surface` | 4.5:1 | "94%" |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Reason text |
| `--color-fg-accent` | `--color-accent-subtle` | 3:1 | Step icon |

## Responsive behaviour

- Panel: one column with the examples under the pitch below 1024 px; two columns from 1024 px.
- Suggestion: the who row keeps avatar, name block and score on one line; the name block shrinks
  (`min-width: 0`) and wraps; the action cluster wraps.
- At 320 px nothing scrolls horizontally; "Start matching" (lg) and the sm actions keep 44 × 44
  CSS px targets on touch devices.

## Accessibility

### Role and pattern

The panel is content inside the page's labelled `section`; its title is an `h2`. Example slots are
illustrative: photos have empty `alt`, names are text. A suggestion is an `article` labelled by
its `h3`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Panel: "Start matching". Suggestion: builder name link, "Say hello", "Pass". |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation |

### Focus

Shared 2 px ring on links and buttons. When a suggestion is passed and removed, the page moves
focus to the next suggestion's heading link, or to the page heading when none remain (D-3).

### Labelling

The score is text, "94% match", never colour or a bar alone (design system: do not claim
compatibility only from a number — the reason sits beside it). Action names stay "Say hello" and
"Pass"; the page adds `aria-describedby` to the heading id so each reads with the builder's name.

### Announcements

None from the component.

### Motion

The grain is static. Example slots' shared transitions run only with
`prefers-reduced-motion: no-preference`.

## Content and internationalisation

- Distances in kilometres, one decimal under 10 km and none above per L2-052 ("5.8 km"; the
  mocks' "26.9 km" becomes "27 km" — D-6).
- Score: an integer with a percent sign, "94%" (L2-022).
- Reasons name the shared skills, distance and open-to goal (design-system content rule).
- Builder names, roles and reasons are data and output-encoded; every other string is a
  catalogue key.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/MatchingPanel.ts` renders the
  home invitation with Daniel, Noah and Caleb; `MatchSuggestion.ts` renders Daniel Reyes, 94%,
  with "Say hello" and "Pass".
- Composite scenarios: `MatchSuggestionList.ts` renders this week's three (Daniel 94%, Noah 88%,
  Ruth 76%) as on `/matching`; `MatchSuggestionListDark.ts` renders them in `data-theme="dark"`.
  Iterations tuned in `e2e/perf-test/config/scenario-iterations.mjs` to 100–300 ms.
- Regression rule: changes run the perf test against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: example photos and avatars declare `width` and `height`; the grain is a CSS
  mask (no image request).

## Acceptance criteria

### Rendering

- **AC-1** Given a visitor on the home page, when the matching section renders, then the panel shows "Co-founder matching", "Looking for a co-founder?", the promise line, "Start matching", "96 co-founder matches so far" and three example slots for Daniel Reyes, Noah Fischer and Caleb Morgan each marked "Mon". (L2-039)
- **AC-2** Given Amara has not set up matching, when she opens `/matching`, then the panel's eyebrow reads "Not set up yet" and "Start matching" links to `/matching/setup`. (L2-021)
- **AC-3** Given this week's suggestions, when `/matching` renders, then each card shows the builder's photo, linked name, role, neighbourhood and distance, the score "94% match", the reason led by "Why you match." and the actions "Say hello" and "Pass". (L2-023)
- **AC-4** Given the dashboard's matches section, when it renders, then three suggestion cards appear best first — Daniel 94%, Noah 88%, Ruth 76% — each with "Say hello" and "Pass". (L2-030)
- **AC-5** Given a new member's dashboard, when "Start here" renders, then three step cards show "Complete your profile", "Share a project" and "Set up matching" in that order with "Step 1 of 3" to "Step 3 of 3" and no score. (L2-030)
- **AC-6** Given a score of 94, when the card renders, then it reads "94%" followed by "match" as text. (L2-022)
- **AC-7** Given a reason containing `<em>`, when the card renders, then the characters show as text. (L2-045)

### States

- **AC-8** Given Esther Nguyen has no photo, when her suggestion renders, then an initials tile "EN" on the sage tone replaces the photo and her name is the heading. (L2-023)

### Keyboard and focus

- **AC-9** Given a suggestion, when the member tabs through it, then focus reaches the name link, "Say hello" and "Pass" in that order with a 2 px ring of at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-10** Given Daniel's card, when a screen reader reads it, then it announces an article named "Daniel Reyes" and reads the score as "94% match" in words. (L2-050)

### Theming

- **AC-11** Given the dark theme, when the panel and a suggestion render, then birch fill, grain, surface, score and well colours resolve from tokens only, and the grain opacity drops to the dark `--grain-opacity`. (L2-051)
- **AC-12** Given either theme, when measured, then panel text reaches 4.5:1 on `--color-panel-birch` and the score reaches 4.5:1 on the surface. (L2-050)

### Content

- **AC-13** Given Noah Fischer 5.8 km away and Daniel Reyes 26.9 km away, when their meta renders, then distances read "5.8 km" and "27 km". (L2-052)

### Responsive

- **AC-14** Given 360 px, when the home panel renders, then the example slots sit under the pitch in one column, nothing scrolls horizontally, and "Start matching" is at least 44 × 44 CSS px. (L2-049)

### Motion

- **AC-15** Given `prefers-reduced-motion: reduce`, when the pointer moves over example slots, then nothing transitions or moves. (L2-050)

### Performance

- **AC-16** Given a change to either component, when the perf test runs `MatchingPanel`, `MatchSuggestion`, `MatchSuggestionList` and `MatchSuggestionListDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/matching-panel/`: `matching-panel.ts` (class
  `MatchingPanel`, selector `bn-matching-panel`), `match-suggestion.ts` (class `MatchSuggestion`,
  selector `article[bn-match-suggestion]`), and their CSS with `.panel`, `.grain`, `.match*`,
  `.suggest*`, `.dialog__who`, `.dialog__icon`, `.card__match`, `.rows__title`, `.rows__meta`.
- Avatars follow the [avatar](avatar.md) markup (`img.avatar`, `span.avatar-initials.tile--*`).
- Step icons are inline SVGs from the iconography set (person, calendar, heart).
- Types `MatchExample` and `MatchSuggestionKind` exported from `public-api.ts`.
- Perf scenarios as listed under *Performance*.

## Decisions

- **D-1** *One CRD for two selectors?* Yes. The design-system page "Matching invitation" defines
  the panel and the suggestion card together, and no other page owns `.suggest`.
- **D-2** *The dashboard's "Start here" steps use `.suggest`.* They are the `step` kind of the
  suggestion card rather than a new component: same markup, an icon tile in place of the avatar
  and no score.
- **D-3** *Focus after a pass removes a card?* The next card's name link, or the page heading when
  none remain; the page does it, since it owns the list.
- **D-4** *The design system's "Paused" variant is the invitation unchanged, while
  `pages/matching/paused` uses an alert.* Paused matching is the [alert](alert.md) on `/matching`;
  the panel has no paused state of its own.
- **D-5** *The dashboard copy under the account-menu dialog and the banners says "Not now";
  `/matching` and the dashboard say "Pass".* "Pass" everywhere, as L2-023 and L2-030 name it; the
  label is a catalogue string projected by the page. Raised with the lead as mock drift.
- **D-6** *The mocks write "26.9 km"; L2-052 says no decimal above 10 km.* L2-052 wins: "27 km".
  Raised with the lead.
- **D-7** *The dashboard meta omits the distance and the reason carries it; `/matching` puts it in
  the meta.* Both are consumer copy through `meta` and `reason`; the component does not compose
  them.
- **D-8** *The rendering shows a faint vertical seam in the grain where the 900 px mask tile
  repeats on a wide panel.* Accepted: the grain is texture at 9 % (6 % in dark) and carries no
  meaning; the component keeps the design system's mask and sizes rather than inventing new ones.
