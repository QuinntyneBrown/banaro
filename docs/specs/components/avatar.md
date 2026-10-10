# Avatar

| Field | Value |
|---|---|
| Selector | `bn-avatar`, `ul[bn-avatar-group]` |
| Library path | `frontend/projects/components/src/lib/avatar/` |
| Status | planned |
| Traces to | L2-008, L2-019, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`avatar.html`](../../design-system/components/avatar.html) |
| Source mocks | [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html), [`pages/event-detail/ended`](../../mocks/pages/event-detail/ended.html), [`pages/messages/default`](../../mocks/pages/messages/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/project-detail/default`](../../mocks/pages/project-detail/default.html), [`pages/matching/reviewed`](../../mocks/pages/matching/reviewed.html), [`dialogs/say-hello/default`](../../mocks/dialogs/say-hello/default.html), [`dialogs/cancel-rsvp/default`](../../mocks/dialogs/cancel-rsvp/default.html), [`notifications/rsvp-toast/success`](../../mocks/notifications/rsvp-toast/success.html) |
| Rendering | [`avatar.html`](avatar.html) |

## Purpose and scope

An avatar identifies a builder beside their name in lists, conversations,
comments and dialogs: a small softly rounded square photo, or initials on a
soft tile when there is no photo. Banaro never uses circles. The avatar group
shows "who is going" as a row of avatars with a count of the rest.

Use the parts owned by other blocks where they exist: the directory card's
64 px portrait is `.card__photo` ([card](card.md)), the featured builder's photo
is `.person__photo` ([person](person.md)), the 96 px profile portrait belongs to
[profile-header](profile-header.md), and the header account button
(`.avatar-btn`) belongs to [top-bar](top-bar.md), which renders a `bn-avatar`
inside it.

Out of scope:

- Uploading, cropping and removing a photo (the `change-photo` dialog, L2-008);
  the avatar only shows the URL it is given.
- Choosing the tile colour (the page derives it from the builder's id so a
  builder keeps one colour everywhere) and computing initials.
- Which attendees may be listed (L2-019 AC1 and L2-036; the page passes only
  members who allow it).
- Presence: the design system's *Status* specimen is an avatar beside a
  [badge](badge.md) `bn-status`, composed by the consumer.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every signed-in page header (`.avatar-btn`, 37 screens) | photo, 40 px, decorative | Amara Osei | default | canvas |
| `pages/messages/*`, `pages/dashboard/*` inbox items | photo, 40 px, decorative | Daniel Reyes, Grace Liu, Hannah Kowalski | default | surface |
| `pages/messages/*` thread head, `dialogs/say-hello/*`, `dialogs/give-feedback/*`, `dialogs/offer-to-help/*`, `dialogs/pass-suggestion/*`, `dialogs/pause-matching/*` (`.dialog__who`) | photo, 48 px, decorative | Daniel Reyes, Esther Nguyen | default | dialog surface |
| `pages/dashboard/*`, `dialogs/account-menu/*`, banners (`.dialog__who`) | photo, 40 px, decorative | — | default | surface |
| `pages/event-detail/*`, `dialogs/cancel-rsvp/*`, `notifications/rsvp-toast/*` host (`.dialog__who`) | initials, 40 px, decorative, `tile--clay` | "NF" Naomi Fraser | default | canvas |
| `pages/project-detail/*` owner (`.dialog__who`) | initials, `tile--sage` | "EN" | default | canvas |
| `pages/event-detail/*` demos list (`.rows`) | photo, 40 px, decorative | Daniel Reyes "Psalter" … Elijah Brooks "Wellspring" | default | canvas |
| `pages/matching/reviewed` rows | photo, 40 px, decorative | Noah Fischer, Ruth Alvarez | default | canvas |
| `pages/project-detail/*`, `dialogs/give-feedback/*` comments | photo, 40 px, decorative | Hannah Kowalski | default | surface |
| `pages/event-detail/*` "Who is going" / "Who came" | group: 6 photos lazy + 3 initials (sage, clay, oat), names visually hidden, "and 55 more" | Caleb Morgan … Joshua Kim | default | canvas |
| Design system *Image*, *Initials*, *Icon*, *Group* | 64 px (`avatar--lg`); initials named `role="img" aria-label="Amara Osei"`; icon tile | — | default | surface |

## Anatomy

**Avatar**

1. **Photo** — `img.avatar` (plus a size modifier), square, `--radius-md`,
   `object-fit: cover`, `width`/`height` attributes equal to the size.
   **or Initials tile** — `span.avatar-initials.tile--{tile}` (plus a size
   modifier), grid-centred one or two letters.
   **or Icon tile** — the same `span.avatar-initials.tile--{tile}` holding an
   `svg.icon`.
2. **Accessible name** — `alt` on the photo, or `role="img"` + `aria-label` on
   the tile, only when the avatar is not decorative.

Host: `bn-avatar` with `display: contents`, so the `img` or `span` is the
flex/grid item of the consumer's layout exactly as in the mocks.

**Avatar group**

1. **List** — `ul.cluster` (the host, `ul[bn-avatar-group]`) with an
   `aria-label` ("Some of the people going").
2. **Item** — `li` holding a decorative `bn-avatar` and `span.vh` with the
   person's name.
3. **More** — final `li.muted` with "and 55 more".

## API

### Inputs — `bn-avatar`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | The person's full name; used as `alt` / `aria-label` when not decorative. |
| `src` | `string \| null` | `null` | no | Photo URL. `null`, or an image that fails to load, shows the tile. |
| `initials` | `string` | `''` | no | One or two letters. Empty with no `src` shows the projected icon. |
| `tile` | `'sage' \| 'clay' \| 'fjord' \| 'oat'` | `'sage'` | no | `tile--{tile}` on the tile. |
| `size` | `'sm' \| 'default' \| 'md' \| 'lg'` | `'default'` | no | 32, 40, 48 or 64 px; adds `avatar--{size}` except for default. Sets the `img` `width`/`height`. |
| `decorative` | `boolean` | `false` | no | Photo `alt=""`; tile `aria-hidden="true"` and no role. Use whenever the name is visible or visually hidden next to it. |
| `lazy` | `boolean` | `false` | no | `loading="lazy"` on the photo. |

### Inputs — `ul[bn-avatar-group]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `people` | `readonly { name: string; src: string \| null; initials: string; tile: 'sage' \| 'clay' \| 'fjord' \| 'oat' }[]` | — | yes | Rendered in order, each as a decorative avatar plus a visually hidden name. The page caps the list (nine in the mocks). |
| `more` | `string \| null` | `null` | no | Already-translated remainder ("and 55 more"); `null` omits the item. |
| `lazy` | `boolean` | `true` | no | Passes `lazy` to every photo (the group sits below the first viewport). |

The consumer sets `aria-label` on the `ul` ("Some of the people going").

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Avatars are passive images; links around them belong to the consumer. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default (`bn-avatar`) | one `svg.icon` | Rendered inside the tile only when there is neither `src` nor `initials` (design system *Icon*). |
| None (`ul[bn-avatar-group]`) | — | Items come from `people`. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Image | `img.avatar` | Builders with a photo. |
| Initials | `span.avatar-initials.tile--*` | Builders 12–23 of the cast, and anyone whose photo was removed (L2-008 AC5). |
| Icon | `span.avatar-initials` + `svg.icon` | A placeholder with no person yet (design system only). |
| Group | `ul.cluster` | Attendee strips. |
| Status | avatar + `bn-status` | Composed by the consumer; no avatar input. |

| Size | Modifier | Box | Use |
|---|---|---|---|
| Small | `.avatar--sm` | `--space-8` (32 px) | Dense lists. |
| Default | — | `--space-10` (40 px) | Header, inbox, rows, comments, groups. |
| Medium | `.avatar--md` | `--space-12` (48 px) | `.dialog__who` in dialogs and the thread head (the mocks get 48 px from `.dialog__who .avatar`). |
| Large | `.avatar--lg` | `--space-16` (64 px) | Design system specimens. |

Initials use `--font-weight-semibold` `--font-size-sm` at every size.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Photo | `src` loads | Photo | `alt` = name, or `alt=""` when decorative |
| Photo failed | `error` event | Initials tile in the same box | Same name rules as the tile |
| No photo | `src` null | Initials tile | `role="img"` + `aria-label`, or `aria-hidden` when decorative |
| Icon | no `src`, no initials | Tile with icon | As the tile |
| Hover, focus, active, disabled | not supported | — | Passive (design system *States*); a wrapping link owns focus |

## Markup

```html
<!-- rendered: decorative photo, default size -->
<bn-avatar><img class="avatar" src="/media/builders/daniel-reyes.jpg" width="40" height="40" alt=""></bn-avatar>
```

```html
<!-- rendered: named photo, large -->
<bn-avatar><img class="avatar avatar--lg" src="/media/builders/daniel-reyes.jpg" width="64" height="64" alt="Daniel Reyes"></bn-avatar>
```

```html
<!-- rendered: decorative initials (mocks) and named initials (design system) -->
<bn-avatar><span class="avatar-initials tile--clay" aria-hidden="true">NF</span></bn-avatar>
<bn-avatar><span class="avatar-initials tile--sage avatar--lg" role="img" aria-label="Amara Osei">AO</span></bn-avatar>
```

```html
<!-- rendered: group -->
<ul bn-avatar-group class="cluster" aria-label="Some of the people going">
  <li><bn-avatar><img class="avatar" src="/media/builders/caleb-morgan.jpg" width="40" height="40" alt="" loading="lazy"></bn-avatar><span class="vh">Caleb Morgan</span></li>
  <li><bn-avatar><span class="avatar-initials tile--sage" aria-hidden="true">EN</span></bn-avatar><span class="vh">Esther Nguyen</span></li>
  <li class="muted">and 55 more</li>
</ul>
```

```html
<!-- consumer -->
<bn-avatar [name]="host.name" [src]="host.photoUrl" [initials]="host.initials" [tile]="host.tile" decorative />
<bn-avatar size="md" [name]="b.name" [src]="b.photoUrl" [initials]="b.initials" decorative />
<ul bn-avatar-group [people]="attendees()" [more]="t('event.going.more', { count: 55 })" [attr.aria-label]="t('event.going.label')"></ul>
```

## Design

- Box `--space-8` / `--space-10` / `--space-12` / `--space-16` by size, corner
  `--radius-md` at every size (the softly rounded square), `flex: none`.
- Initials: grid, centred, `--font-weight-semibold` `--font-size-sm` line
  height 1 in `--font-family-sans`, `--color-tile-fg` on `--color-tile-*`.
- Group: `.cluster` flex wrap, gap `--space-3`, items centred; the remainder
  `li.muted` in `--color-fg-muted` body text.
- No motion, no elevation, no layer.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Sizes are modifiers over spacing tokens. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Initials text | `--color-tile-fg` | `--palette-ink-900` | `--palette-night-50` |
| Sage tile | `--color-tile-sage` | `--palette-sage-100` | `--palette-sage-900` |
| Clay tile | `--color-tile-clay` | `--palette-clay-100` | `--palette-clay-900` |
| Fjord tile | `--color-tile-fjord` | `--palette-fjord-100` | `--palette-fjord-900` |
| Oat tile | `--color-tile-oat` | `--palette-oat-200` | `--palette-night-800` |
| "and 55 more" | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-tile-fg` | `--color-tile-sage` | 4.5:1 | Initials on sage |
| `--color-tile-fg` | `--color-tile-clay` | 4.5:1 | Initials on clay |
| `--color-tile-fg` | `--color-tile-fjord` | 4.5:1 | Initials on fjord |
| `--color-tile-fg` | `--color-tile-oat` | 4.5:1 | Initials on oat |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | "and 55 more" |

Photos are not colour-managed by tokens. Under `forced-colors: active` the
tile fill disappears and the letters stay in `CanvasText`.

## Responsive behaviour

- The avatar never changes size with the viewport; the consumer picks the size.
- The group wraps onto further lines at narrow widths; at 320 px nine avatars
  and "and 55 more" wrap without horizontal scroll.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices (the avatar is not a target; a link around it supplies the target).

## Accessibility

### Role and pattern

An image (`img`, or a tile with `role="img"`), or decoration. The group is a
native list with a label. No ARIA widget pattern.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips the avatar; an account button or link around it is the stop. |

### Focus

None of its own; a wrapping control shows the shared focus ring.

### Labelling

- Beside a visible or visually hidden name, the avatar is decorative (`alt=""`
  or `aria-hidden`), so the name is read once — every mock use.
- Standing alone it is named with the person's full name ("Amara Osei"), never
  a file name.
- The group reads as a list labelled "Some of the people going" of names, then
  "and 55 more".

### Announcements

None.

### Motion

None. The photo hover scale in the mocks applies to `.person__photo` only.

## Content and internationalisation

- Initials are the first letters of the first and last name, upper case, at
  most two ("AO", "EN", "NF"); for one-word names, one letter.
- Names are data and encoded on output.
- Translatable: the group's `aria-label` and `more` ("and 55 more"), with the
  number formatted by the page ("and 1,204 more").

## Performance

- Change detection: `OnPush`, signal inputs; the photo/tile switch and the
  size class are `computed`.
- Every photo declares `width` and `height`; group photos are `lazy`
  (L2-048 AC3).
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/Avatar.ts`
  renders Daniel Reyes's 40 px decorative photo and Naomi Fraser's "NF" clay
  tile; `frontend/projects/perf-test/src/scenarios/AvatarGroup.ts` renders the
  Fall Demo Night strip (Caleb Morgan, Hannah Kowalski, Marcus Bennett, Leah
  Thompson, Peter Walsh, Amara Osei, Esther Nguyen, Naomi Fraser, Joshua Kim,
  "and 55 more"); iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep each at roughly 100–300 ms.
- Composite scenarios: `TopBar` (the account avatar), `DarkTheme`.
- Layout stability: the box size is fixed before the image loads, and a failed
  image swaps to a tile of the same size.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given Daniel Reyes's photo beside his name in the inbox, when the avatar renders, then it is an `img.avatar` with `width="40"`, `height="40"` and `alt=""`, and its box is 40 × 40 CSS px before the image loads. (L2-048)
- **AC-2** Given the "Who is going" strip of Fall Demo Night, when it renders, then every photo in it has `loading="lazy"`. (L2-048)
- **AC-3** Given Naomi Fraser has no photo, when her host avatar renders, then it is a `span.avatar-initials.tile--clay` reading "NF" in a 40 × 40 box. (L2-008)
- **AC-4** Given Amara Osei removes her photo, when the header renders afterwards with `src` null, then her avatar shows the initials "AO" on her tile instead of the photo. (L2-008)
- **AC-5** Given a photo URL that fails to load, when the image raises its error event, then the avatar shows the initials tile in the same box and the surrounding layout does not move. (L2-048)
- **AC-6** Given `size` md, sm and lg, when each renders, then the box is 48, 32 and 64 CSS px respectively, with `--radius-md` corners. (L2-051)

### Screen readers

- **AC-7** Given a decorative avatar next to the name "Daniel Reyes", when a screen reader reads the row, then "Daniel Reyes" is announced once and the avatar is not announced. (L2-050)
- **AC-8** Given a standalone initials avatar for Amara Osei, when a screen reader reaches it, then it is announced as an image named "Amara Osei". (L2-050)
- **AC-9** Given the "Who is going" strip with nine people and the remainder "and 55 more", when a screen reader reads it, then it announces a list labelled "Some of the people going" with ten items: the nine names, then "and 55 more". (L2-019)

### Keyboard and focus

- **AC-10** Given a page with avatars outside any link or button, when the member tabs through it, then no avatar receives focus. (L2-050)

### Theming

- **AC-11** Given initials on the sage, clay, fjord and oat tiles, when rendered in the light theme, then each measures at least 4.5:1 against its tile. (L2-050)
- **AC-12** Given the same tiles in the dark theme, when rendered, then the tile colours change only through the theme's token values and each still measures at least 4.5:1. (L2-051)

### Responsive

- **AC-13** Given the "Who is going" strip at 320 px, when it renders, then the avatars and "and 55 more" wrap onto further lines and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-14** Given a change to the avatar, when the `Avatar` and `AvatarGroup` perf-test scenarios run against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/avatar/`:
  `avatar.ts` (class `Avatar`, selector `bn-avatar`, host `display: contents`)
  and `avatar-group.ts` (class `AvatarGroup`, selector `ul[bn-avatar-group]`,
  host class `cluster`), with templates and styles; export from `public-api.ts`.
- The template switches photo / tile with `@if`; the icon `ng-content` appears
  once, inside the tile branch.
- An `(error)` handler on the `img` sets a signal that falls back to the tile.
- Move `.avatar`, `.avatar--*`, `.avatar-initials`, `.tile--*` rules into the
  component styles (keep class names); `.dialog__who .avatar` 48 px stays in
  the consumers until they adopt `size="md"`.
- [top-bar](top-bar.md)'s account button should render `bn-avatar` inside
  `.avatar-btn` when it is next touched.
- Scenarios: add `Avatar.ts` and `AvatarGroup.ts`; export from
  `scenarios/index.ts`.

## Decisions

- **D-1** *Group markup: the design system's `div.avatar-group` with a "+3 builders" span, or the mocks' `ul.cluster` with hidden names and "and 55 more"?* The mocks' list. It is the only product use, it gives screen readers every name, and visual parity tests compare with the mocks. Raised with the lead so the design-system *Group* specimen can catch up.
- **D-2** *Which size does `.dialog__who` use?* `md` (48 px), which reproduces the mocks' `.dialog__who .avatar` rule through the component's own modifier; the 40 px uses in the dashboard and banners keep the default size.
- **D-3** *Decorative or named in the mocks?* Decorative everywhere in the mocks, because a name is always adjacent; the named form exists for the design system's standalone specimens and is the default so a forgotten `decorative` errs towards an extra announcement rather than a missing name.
- **D-4** *Is the icon variant needed?* It stays as the default slot because the design system defines it; no mock uses it yet.
- **D-5** *Does the avatar own presence?* No. The *Status* specimen is an avatar and a `bn-status` side by side; composing them keeps presence text in one component.
