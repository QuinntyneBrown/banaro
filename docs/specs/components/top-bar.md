# Top bar

| Field | Value |
|---|---|
| Selector | `bn-top-bar`; `a[bn-icon-button], button[bn-icon-button]` (the shared icon button, folder `icon-button/`); `button[bn-theme-switch]` (folder `theme-switch/`); it also renders the brand `a[bn-brand]` |
| Library path | `frontend/projects/components/src/lib/top-bar/` (icon button: `frontend/projects/components/src/lib/icon-button/`; theme switch: `frontend/projects/components/src/lib/theme-switch/`; theme state: `lib/theme/theme.service.ts`) |
| Status | built |
| Traces to | L2-003, L2-022, L2-027, L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`top-bar.html`](../../design-system/components/top-bar.html), pattern [`navigation.html`](../../design-system/patterns/navigation.html) |
| Source mocks | Signed out: [`pages/home/default`](../../mocks/pages/home/default.html) and every state of `about`, `code-of-conduct`, `contact`, `forgot-password`, `join`, `maintenance`, `offline`, `privacy`, `reset-password`, `sign-in`, `verify-email`. Signed in: [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html) and every state of `builder-profile`, `dashboard`, `directory`, `event-detail`, `events`, `forbidden`, `matching`, `matching-setup`, `messages`, `not-found`, `notifications`, `onboarding`, `profile-edit`, `project-detail`, `project-edit`, `project-new`, `projects`, `server-error`, `settings`, every dialog and every notification mock. |
| Rendering | [`top-bar.html`](top-bar.html) |

## Purpose and scope

The top bar opens every page of the member app: the Banaro brand, the primary navigation (Builders ·
Projects · Events · Matching), the theme switch, and the account area. A visitor sees "Sign in" and
"Join Banaro"; a signed-in member sees "2 new matches", Messages and Notifications with unread
counts, and their avatar, which opens the account menu. From 992 px the navigation sits inline;
below 992 px it hides behind a "Menu" button that opens it as a modal sheet.

This CRD also owns the **icon button** (`.icon-btn`), the round, icon-only control the header uses
for Messages, Notifications and the theme switch, and that dialogs, toasts and banners use for their
close and dismiss controls. It is specified here once, in *Icon button*, and the
[dialog](dialog.md), [toast](toast.md) and [banner](alert.md) CRDs reference it.

It also owns the product's theme switch (L2-051): a toggle button in the header actions that flips
between the light and dark themes through `ThemeService` and reflects the current theme, including
changes made with the `t` shortcut.

Out of scope:

- The account menu's items and keyboard model ([menu](menu.md)); the top bar renders only its
  trigger, the avatar button, and hands the menu template to it.
- The brand's own rules ([brand](brand.md)) and the visitor buttons ([button](button.md)).
- The `t` shortcut listener (`ThemeShortcut` in each application's `shell/`), storing the theme and
  syncing it (`ThemeService`, `THEME_SYNC`); the switch only calls `ThemeService.toggle()`.
- Fetching counts and the member; the shell passes them in.
- The skip link before the header ([skip link](skip-link.md)) and banners above it.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Public pages (34 files: `home`, `about`, `sign-in`, `join`, legal, error and offline pages) | signed out; brand → `/` | `[slot=actions]`: "Sign in" (text button, `.header__signin`, hidden below LG), "Join Banaro" (primary, sm); theme switch; menu button | nav link current on none; sheet closed | canvas |
| Member pages, dialogs and notifications (162 files) | signed in; brand → `/dashboard`; `member` Amara Osei | matches link "2 new matches"; Messages "1 unread message" with badge 1; Notifications "3 unread notifications" with badge 3; avatar button "Your account, Amara Osei" (photo, "Amara" from LG); theme switch; menu button | current link: Builders (directory, builder-profile), Projects (projects, project-*), Events (events, event-detail), Matching (matching, matching-setup), none elsewhere | canvas; inert behind dialogs |
| `dialogs/account-menu/default` | signed in, account menu open | avatar button `aria-expanded="true"`; menu below it | open account menu | canvas |
| Any page < 992 px | menu button "Menu" (label hidden below 480 px) | nav sheet with four links and "Close menu" | sheet open, closed | `--color-bg-surface-raised` sheet over backdrop |
| Every dialog mock (45 files) | icon button, `size="sm"`, `button` | × icon, label "Close dialog" | default, hover, focus, disabled (busy, D-3 of [dialog](dialog.md)) | dialog surface |
| `notifications/toast`, `notifications/rsvp-toast` (12 files) | icon button, `size="sm"`, `button`, extra class `toast__close` | × icon, label "Dismiss notification" | default, hover, focus | toast surface |
| `notifications/account-banner`, `connection-banner`, `site-banner` (12 files) | icon button, `md`, `button` | × icon, label "Dismiss banner" | default, hover, focus | banner tint |
| Design-system "with search" and "compact" specimens | — | a search field in the header | — | not used by any screen (D-6) |

## Anatomy

1. **Header** — `header.header` (banner landmark), `div.wrap.header__inner` inside: flex row, min
   height `--layout-topbar-height`, bottom hairline.
2. **Brand** — `a.brand[bn-brand]` named "Banaro home", linking to `/` (visitor) or `/dashboard`
   (member).
3. **Primary navigation** — `nav.nav#primary-nav[aria-label=Primary]` with `ul.nav__list` of
   `a.nav__link`; the current link has `aria-current="page"` and a dot below it.
4. **Close menu** — `button.btn.btn--quiet.nav__close`, only in the sheet.
5. **Actions** — `div.header__actions`, pushed to the end:
   - visitor: projected `[slot=actions]`;
   - member: `a.matches-link` (heart icon + "2 new matches", from LG), `a.icon-btn` Messages and
     `a.icon-btn` Notifications, each with `span.icon-btn__count[aria-hidden]`, and
     `button.avatar-btn` (avatar image + first name span, from LG);
   - `button.icon-btn.theme-switch` (`bn-theme-switch`), from 480 px;
   - `button.menu-btn` with icon and `span.menu-btn__label` (below LG).
6. **Navigation sheet** — below LG, the same `nav.nav` rendered in a CDK overlay pane inside a
   `div.nav-sheet[role=dialog][aria-modal=true]`, with the `.nav--sheet` modifier, over a
   `.backdrop`. Below 480 px the sheet also holds the theme switch as a full-width quiet button
   `button.btn.btn--quiet.nav__theme` ("Dark theme", `aria-pressed`) above "Close menu".

Host: `bn-top-bar` is `display: block`; it renders the `header` inside.

### Icon button

1. **Control** — the host native `a` or `button` with class `.icon-btn` (plus `.icon-btn--sm` for
   the small size); a circle, transparent until hovered.
2. **Icon** — one projected `svg.icon[aria-hidden=true]`, `currentColor`.
3. **Count badge (optional)** — `span.icon-btn__count[aria-hidden=true]`, top-right.

The host is the native element, so links keep link semantics and buttons keep `type` and
`disabled`; consumers add their own classes (`toast__close`).

## API

### `bn-top-bar` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `brandName` | `string` | — | yes | Visible wordmark ("banaro"). |
| `brandLabel` | `string` | — | yes | Brand link name ("Banaro home"). Translatable. |
| `brandLink` | `string` | `'/'` | no | `/` for visitors, `/dashboard` for members. |
| `navLabel` | `string` | — | yes | `aria-label` of the nav ("Primary"). Translatable. |
| `items` | `NavItem[]` (`{ label: string; link: string }`) | `[]` | no | Primary links in order. Empty hides the nav and the menu button. Current link from `routerLinkActive` (prefix match, so `/builders/daniel-reyes` marks Builders). |
| `menuLabel` | `string` | — | yes | Menu button `aria-label` and visible label ("Menu"); also names the sheet. |
| `closeMenuLabel` | `string` | — | yes | "Close menu". |
| `themeLabel` | `string` | — | yes | Theme switch name ("Dark theme"). Translatable. |
| `member` | `TopBarMember \| null` (`{ name: string; firstName: string; photo: string \| null; initials: string }`) | `null` | no | `null` renders the visitor actions slot; a member renders the member actions. |
| `counts` | `{ matches: number; messages: number; notifications: number }` | all `0` | no | Badge numbers; `0` hides a badge and hides the matches link; above 99 shows "99+". |
| `memberLinks` | `{ matches: string; messages: string; notifications: string }` | `{ matches: '/matching', messages: '/messages', notifications: '/notifications' }` | no | Targets of the member links. |
| `matchesLabel` | `string` | `''` | when `counts.matches > 0` | Visible and accessible text, "2 new matches". Translatable with the count. |
| `messagesLabel` | `string` | — | when `member` | Accessible name, "1 unread message" / "Messages". Translatable with the count. |
| `notificationsLabel` | `string` | — | when `member` | Accessible name, "3 unread notifications" / "Notifications". Translatable with the count. |
| `accountLabel` | `string` | — | when `member` | Avatar button name, "Your account, Amara Osei". |
| `accountMenu` | `TemplateRef<unknown> \| null` | `null` | when `member` | The [menu](menu.md) template the avatar button opens through `CdkMenuTrigger`. |

### `bn-icon-button` inputs (`a[bn-icon-button], button[bn-icon-button]`)

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Sets `aria-label`; the only accessible name, since the content is an `aria-hidden` icon. Translatable. An empty label is a programming error (the component throws in dev mode). |
| `count` | `number \| null` | `null` | no | Shows `.icon-btn__count` when greater than 0, as the number up to 99 and "99+" above. The badge is `aria-hidden`; the consumer puts the count in `label`. |
| `size` | `'md' \| 'sm'` | `'md'` | no | `md`: `--target-comfortable` circle. `sm`: `--space-8` circle (dialog close, toast dismiss) with a hit area grown to `--target-comfortable` below 576 px. |
| `pressed` | `boolean \| null` | `null` | no | `null` renders no `aria-pressed`; a boolean makes it a toggle button (`aria-pressed`) with the pressed styling. Buttons only. |

Slot: default — exactly one `svg.icon[aria-hidden=true]`.

### `bn-theme-switch` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Constant accessible name, "Dark theme". |

It is an icon button (`IconButton` as a host directive, `size="md"`, moon icon) whose `pressed` is
`ThemeService.effective() === 'dark'`; activating it calls `ThemeService.toggle()`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `menuOpened` (`bn-top-bar`) | `void` | The navigation sheet opens. |
| `menuClosed` (`bn-top-bar`) | `'link' \| 'close-button' \| 'escape' \| 'backdrop' \| 'breakpoint'` | The sheet closes. |

The theme switch has no output; the theme change is the `ThemeService` signal.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=actions]` | visitor actions: `a[bn-button][variant=text].header__signin`, `a[bn-button][variant=primary][size=sm]` | Rendered only when `member` is `null`, before the theme switch. Declared once. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Signed out | `member = null` | Public pages. |
| Signed in | `member` set | Every member page, dialog and notification. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | `--layout-topbar-height` (min) | `.wrap`: `--layout-margin` inline | links `--font-weight-medium` body; menu button `--text-label` |

Width: `.wrap` caps the row at `--layout-container-max` plus margins.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Link default | — | `--color-fg-muted` | — |
| Link hover | `:hover` | `--color-fg-default`; sheet links also `--color-bg-subtle` | — |
| Link focus | `:focus-visible` | 2 px `--color-focus-ring` ring | — |
| Link current | `aria-current="page"` | `--color-fg-default` + `--color-accent` dot below | "current page" |
| Badge | count > 0 | `.icon-btn__count` with the number, "99+" above 99 | Name carries the count; badge `aria-hidden` |
| No unread | count 0 | No badge; matches link hidden | Name without a count ("Messages") |
| Icon button hover / focus | `:hover`, `:focus-visible` | `--color-bg-subtle` circle; focus ring | — |
| Icon button default | — | `--color-fg-muted` icon, transparent | Name from `label` |
| Icon button hover / active | `:hover`, `:active` | `--color-bg-subtle` circle, icon `--color-fg-default` | — |
| Icon button focus | `:focus-visible` | 2 px `--color-focus-ring` ring | — |
| Icon button disabled | `disabled` (buttons) | Icon `--color-fg-disabled`, no hover | Out of the tab order |
| Theme switch off / on | `aria-pressed="false"` / `"true"` | Outline moon / filled moon on `--color-accent-subtle` | "Dark theme, toggle button, not pressed / pressed" |
| Account menu open | menu attached | Avatar button unchanged; menu below | `aria-expanded="true"` on the avatar button |
| Sheet closed | < 992 px | Menu button only | Menu button `aria-expanded="false"` |
| Sheet open | menu button | Backdrop; sheet inset `--space-3` from the top and sides; links stacked; "Close menu" full width | `role="dialog"`, `aria-modal`, named "Menu"; focus on the first link; Tab contained |
| Inline nav | ≥ 992 px | Links in a row after the brand; no menu button; "Sign in" and the matches link show | — |
| Inert | a dialog is open | Unchanged | Hidden from assistive technology by the dialog |

## Markup

```html
<!-- rendered: signed in, ≥ 992 px, on /builders -->
<header class="header">
  <div class="wrap header__inner">
    <a class="brand" href="/dashboard" aria-label="Banaro home"><svg class="brand__mark" aria-hidden="true">…</svg><span>banaro</span></a>
    <nav class="nav" id="primary-nav" aria-label="Primary">
      <ul class="nav__list">
        <li><a class="nav__link" href="/builders" aria-current="page">Builders</a></li>
        <li><a class="nav__link" href="/projects">Projects</a></li>
        <li><a class="nav__link" href="/events">Events</a></li>
        <li><a class="nav__link" href="/matching">Matching</a></li>
      </ul>
    </nav>
    <div class="header__actions">
      <a class="matches-link" href="/matching"><svg class="icon icon--sm" aria-hidden="true">…</svg>2 new matches</a>
      <a class="icon-btn" href="/messages" aria-label="1 unread message"><svg class="icon" aria-hidden="true">…</svg><span class="icon-btn__count" aria-hidden="true">1</span></a>
      <a class="icon-btn" href="/notifications" aria-label="3 unread notifications"><svg class="icon" aria-hidden="true">…</svg><span class="icon-btn__count" aria-hidden="true">3</span></a>
      <button type="button" class="avatar-btn" aria-label="Your account, Amara Osei" aria-haspopup="menu" aria-expanded="false"><img class="avatar" src="…/amara-osei.jpg" width="40" height="40" alt=""><span>Amara</span></button>
      <button type="button" class="icon-btn theme-switch" aria-label="Dark theme" aria-pressed="false"><svg class="icon" aria-hidden="true">…moon…</svg></button>
      <button type="button" class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="primary-nav"><svg class="icon icon--sm" aria-hidden="true">…</svg><span class="menu-btn__label">Menu</span></button>
    </div>
  </div>
</header>
```

```html
<!-- rendered: icon buttons -->
<button type="button" class="icon-btn icon-btn--sm" aria-label="Close dialog"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
<button type="button" class="icon-btn icon-btn--sm toast__close" aria-label="Dismiss notification">…</button>
<a class="icon-btn" href="/notifications" aria-label="3 unread notifications"><svg class="icon" aria-hidden="true">…</svg><span class="icon-btn__count" aria-hidden="true">3</span></a>
```

```html
<!-- consumer: icon buttons -->
<button bn-icon-button size="sm" type="button" [label]="'common.closeDialog' | t" (click)="close()"><svg class="icon" aria-hidden="true">…</svg></button>
<a bn-icon-button routerLink="/notifications" [count]="counts().notifications" [label]="notificationsLabel()"><svg class="icon" aria-hidden="true">…</svg></a>
```

```html
<!-- rendered: signed out actions -->
<div class="header__actions">
  <a class="btn btn--text header__signin" href="/sign-in">Sign in</a>
  <a class="btn btn--primary btn--sm" href="/join">Join Banaro</a>
  <button type="button" class="icon-btn theme-switch" aria-label="Dark theme" aria-pressed="true">…</button>
  <button type="button" class="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="primary-nav">…</button>
</div>
```

```html
<!-- rendered: navigation sheet open, < 992 px (in the CDK overlay container) -->
<div class="cdk-overlay-backdrop backdrop cdk-overlay-backdrop-showing"></div>
<div class="cdk-overlay-pane bn-nav-sheet-pane">
  <div class="nav-sheet" role="dialog" aria-modal="true" aria-label="Menu">
    <nav class="nav nav--sheet" id="primary-nav" aria-label="Primary">
      <ul class="nav__list">…four links…</ul>
      <button type="button" class="btn btn--quiet nav__close">Close menu</button>
    </nav>
  </div>
</div>
```

```html
<!-- consumer: banaro shell -->
<bn-top-bar
  brandName="banaro"
  [brandLabel]="'shell.home' | t"
  [brandLink]="member() ? '/dashboard' : '/'"
  [navLabel]="'shell.primary' | t"
  [items]="navItems()"
  [menuLabel]="'shell.menu' | t"
  [closeMenuLabel]="'shell.closeMenu' | t"
  [themeLabel]="'shell.darkTheme' | t"
  [member]="member()"
  [counts]="counts()"
  [matchesLabel]="'shell.newMatches' | t: { count: counts().matches }"
  [messagesLabel]="'shell.unreadMessages' | t: { count: counts().messages }"
  [notificationsLabel]="'shell.unreadNotifications' | t: { count: counts().notifications }"
  [accountLabel]="'shell.yourAccount' | t: { name: member()?.name }"
  [accountMenu]="accountMenu"
>
  <a slot="actions" bn-button variant="text" class="header__signin" routerLink="/sign-in">{{ 'shell.signIn' | t }}</a>
  <a slot="actions" bn-button variant="primary" size="sm" routerLink="/join">{{ 'shell.join' | t }}</a>
</bn-top-bar>
```

## Design

- Header: layer `--z-sticky`, `position: relative`; inner row gap `--space-4`, min height
  `--layout-topbar-height`, bottom rule `--border-width-hairline` `--color-border-default`.
- Actions: gap `--space-2`, `margin-left: auto`.
- Inline nav (LG up): margin-left `--space-10`; list gap `--space-2`; links min height
  `--control-height-md`, padding `0 var(--space-4)`.
- Sheet nav: padding `--space-5`; inset `--space-3` top and sides; `--color-bg-surface-raised`,
  radius `--radius-lg`, `--shadow-4`, hairline `--color-border-default`; links min height
  `--target-comfortable`, padding `0 var(--space-3)`, radius `--radius-md`; list gap `--space-1`;
  "Close menu" margin-top `--space-3`, full width.
- Current dot: `--space-1` square, `--radius-full`, `--color-accent`, `--space-1` above the link's
  bottom edge.
- Menu button: min height `--target-comfortable`, padding `0 var(--space-4)`, hairline
  `--color-border-default`, radius `--radius-full`, `--color-bg-surface`, `--text-label`; below
  480 px it is a `--target-comfortable` square with the label hidden.
- Icon button `sm` (`.icon-btn--sm`, today's `.dialog__header .icon-btn` and `.toast__close`
  rule): `--space-8` circle with a negative margin of `--space-1` / `--space-2` where the host
  layout asks for it; below 576 px a transparent extension makes the hit area
  `--target-comfortable`. Disabled: `--color-fg-disabled`, `cursor: not-allowed`.
- `.icon-btn` (Messages, Notifications, theme switch, banner dismiss): `--target-comfortable` circle,
  `--color-fg-muted`, hover `--color-bg-subtle`; count badge at `--space-1` from the top-right,
  min width `--space-5`, height `--space-5`, `--color-accent` with `--color-fg-on-accent`,
  `--font-weight-bold`.
- Theme switch pressed: `--color-accent-subtle` fill, icon `--color-fg-accent`, moon filled.
- Avatar button: padding `--space-1`, radius `--radius-md`, gap `--space-3`, `--text-label`; avatar
  `--space-10` square, `--radius-md`; name span from LG.
- Matches link: `--text-label`, gap `--space-2`, min height `--target-comfortable`, from LG.
- Motion: colour transitions `--duration-fast` / `--duration-base` with `--ease-standard`; the sheet
  enters with `settle` (fade and rise by `--space-3`) over `--duration-slow` `--ease-enter`.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Header rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Link | `--color-fg-muted`, current `--color-fg-default` | resolved live | resolved live |
| Current dot | `--color-accent` | resolved live | resolved live |
| Badge | `--color-accent` / `--color-fg-on-accent` | resolved live | resolved live |
| Icon buttons | `--color-fg-muted`, hover `--color-bg-subtle` | resolved live | resolved live |
| Theme switch pressed | `--color-accent-subtle` / `--color-fg-accent` | `--palette-sage-50` / `--palette-sage-700` | `--palette-sage-950` / `--palette-sage-300` |
| Menu button | `--color-bg-surface`, `--color-border-default` | resolved live | resolved live |
| Sheet | `--color-bg-surface-raised` | `--palette-white` | `--palette-night-850` |
| Backdrop | `--color-bg-backdrop` | warm ink at 45 % | black at 60 % |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Nav links |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Current link, matches link, name |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Badge number |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Pressed theme switch icon |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Sheet links |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

## Responsive behaviour

- Below 480 px: the menu button shows only its icon, 44 × 44 px, and the theme switch moves from
  the header row into the navigation sheet (D-11), so the signed-in row fits at 320 px.
- Below 992 px (XS to MD): navigation hidden behind "Menu"; "Sign in", the matches link and the
  member's first name are hidden; brand, (visitor) "Join Banaro" or (member) Messages,
  Notifications, avatar, then theme switch and menu button remain.
- From 992 px (LG): inline navigation after the brand; menu button and "Close menu" gone; "Sign in",
  "2 new matches" and "Amara" shown.
- Crossing 992 px with the sheet open closes the sheet (`menuClosed('breakpoint')`).
- At 320 px the signed-in row (brand, Messages, Notifications, avatar, theme switch, menu) fits
  without horizontal scroll; the wordmark never wraps; every target is at least 44 × 44 CSS px.

## Accessibility

### Role and pattern

`header` is the banner landmark and the nav a `navigation` landmark named "Primary" (L2-050 AC5).
Below LG the menu button and sheet follow the WAI-ARIA
[Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) pattern; the avatar
button is a [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) (`aria-haspopup="menu"`);
the theme switch is a toggle button (`aria-pressed`).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Brand, nav links (LG up), actions in order, theme switch, menu button. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on "Menu" | Opens the sheet; focus moves to the first link. |
| <kbd>Tab</kbd> in the sheet | Cycles through the four links, "Dark theme" (below 480 px) and "Close menu". |
| <kbd>Escape</kbd> in the sheet | Closes it; focus returns to "Menu". |
| <kbd>Enter</kbd> on a sheet link | Navigates and closes the sheet; the shell then moves focus to `main`. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the avatar | Opens the account menu ([menu](menu.md)); Escape returns focus to the avatar. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the theme switch | Toggles the theme. |

### Focus

2 px `--color-focus-ring` ring at `--focus-ring-offset` on every control. The sheet traps focus
while open (it is modal) and returns it to "Menu" on Escape, backdrop or "Close menu".

### Labelling

- Brand "Banaro home"; nav "Primary"; menu button "Menu" (equals the visible label); sheet "Menu".
- Unread links: "1 unread message", "3 unread notifications"; with none, "Messages",
  "Notifications". The badge is `aria-hidden`; the name carries the number (L2-027 AC2).
- "2 new matches" is visible text; the heart icon is `aria-hidden`.
- Avatar button "Your account, Amara Osei", `aria-haspopup="menu"`, `aria-expanded`; avatar
  `alt=""`.
- Theme switch "Dark theme", `aria-pressed`. The name never changes with the state (D-4).
- Current page by `aria-current="page"` and a dot, not colour alone.

### Announcements

None. Count changes update the names quietly; the notifications page announces its own changes.

### Motion

Colour transitions and the sheet's entrance are removed under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Navigation in this order and wording: Builders · Projects · Events · Matching.
- Visitor actions "Sign in", "Join Banaro"; menu "Menu", "Close menu".
- Counts use L2-052 number formatting; badges cap at "99+"; names: "1 unread message",
  "12 unread messages", "3 unread notifications", "2 new matches" (plural rules from the catalogue).
- Translatable inputs: `brandLabel`, `navLabel`, `menuLabel`, `closeMenuLabel`, `themeLabel`,
  `matchesLabel`, `messagesLabel`, `notificationsLabel`, `accountLabel`, `items[].label`, the
  actions slot. Data values: member name, first name, photo, initials, counts.
- French is about 30 % longer: the inline nav has room at 992 px for "Bâtisseurs · Projets ·
  Événements · Jumelage"; labels never truncate.

## Performance

- Change detection: `OnPush`, signal inputs; `computed` for badge text ("99+") and visibility.
- Perf-test scenarios: `TopBar.ts` (exists; visitor header with "Sign in" and "Join Banaro"), new
  `TopBarMember.ts` (Amara Osei with 2 new matches, 1 message, 3 notifications, on `/builders`), and
  new `ThemeSwitch.ts` (one `bn-theme-switch` "Dark theme"), and new `IconButton.ts` (the Notifications
link with count 3); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` (contains `TopBar`).
- Layout stability: the header is server-rendered with the member and counts, and the avatar image
  declares 40 × 40, so nothing shifts on hydration; a count change from 9 to 10 widens only the
  badge, never the row's other items (badge is absolutely positioned).
- Weight: `@angular/router`, `@angular/cdk/overlay`, `@angular/cdk/a11y`, `@angular/cdk/layout`,
  `@angular/cdk/menu` (trigger only).

## Acceptance criteria

### Rendering

- **AC-1** Given a visitor on `/` at 1280 px, when the header renders, then it shows the brand "Banaro home" linking to `/`, the links Builders, Projects, Events and Matching in that order, "Sign in", "Join Banaro", the theme switch, and no menu button. (L2-039)
- **AC-2** Given Amara signed in with 2 new matches, 1 unread message and 3 unread notifications, when any member page renders at 1280 px, then the header shows "2 new matches", a Messages link named "1 unread message" with badge "1", a Notifications link named "3 unread notifications" with badge "3", and her avatar with "Amara". (L2-039)
- **AC-3** Given Amara has 140 unread notifications, when the header renders, then the badge reads "99+" and the link's name is "140 unread notifications"; given none, then no badge shows and the name is "Notifications". (L2-027)
- **AC-4** Given Amara has no new matches, when the header renders at 1280 px, then the matches link is not shown; given 2, then it reads "2 new matches" and links to `/matching`. (L2-022)
- **AC-5** Given Amara on `/builders/daniel-reyes`, when the header renders, then "Builders" has `aria-current="page"` and the dot, and no other link does. (L2-050)

### States

- **AC-6** Given Amara at 1280 px, when she activates her avatar, then the account menu opens below it and the avatar button has `aria-haspopup="menu"` and `aria-expanded="true"`; when she chooses "Sign out", then the menu closes first. (L2-003)
- **AC-7** Given the light theme, when Amara activates "Dark theme", then the page switches to dark at once and the switch has `aria-pressed="true"`; activating it again returns to light with `aria-pressed="false"`. (L2-051)
- **AC-8** Given the theme switch shows "not pressed", when Amara presses `t` outside a text field, then the theme turns dark and the switch shows `aria-pressed="true"` without a reload. (L2-051)
- **AC-9** Given Amara chose dark and reloads, when the server renders the header, then the switch already has `aria-pressed="true"` in the HTML and there is no flash of the light theme. (L2-051)

### Keyboard and focus

- **AC-10** Given 360 px, when Amara activates "Menu", then a sheet named "Menu" with `aria-modal="true"` opens, "Menu" has `aria-expanded="true"`, focus is on "Builders", and Tab cycles only through the four links, "Dark theme" and "Close menu". (L2-050)
- **AC-11** Given the open sheet, when Amara presses Escape or "Close menu", then the sheet closes and focus returns to "Menu". (L2-050)
- **AC-12** Given the open sheet, when Amara chooses "Events", then the sheet closes and `/events` opens with "Events" current. (L2-049)
- **AC-13** Given keyboard navigation, when each header control receives focus, then it shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast against the canvas. (L2-050)

### Screen readers

- **AC-14** Given any page, when its landmarks are listed, then the header is a `banner` and the navigation a `navigation` named "Primary", and axe-core reports no WCAG 2.2 A or AA violations for the header, signed in and out, sheet open and closed, in both themes. (L2-050)
- **AC-15** Given the unread badges, when read by a screen reader, then each badge number is hidden and the count is heard once in the link's name. (L2-050)

### Theming

- **AC-16** Given the dark theme, when the header renders, then nav links, the badge number and the pressed switch icon each measure at least 4.5:1 against their backgrounds. (L2-050)
- **AC-17** Given the top bar's and the theme switch's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-18** Given 360 px, when a member page renders, then the navigation is behind the "Menu" button, "2 new matches" and "Amara" are hidden, and there is no horizontal scroll. (L2-049)
- **AC-19** Given 320 px signed in, when the header renders, then brand, Messages, Notifications, avatar and the icon-only "Menu" fit on one row, each at least 44 × 44 px, and "Dark theme" is inside the navigation sheet. (L2-049)
- **AC-20** Given the sheet open at 768 px, when the viewport widens to 1280 px, then the sheet closes and the links show inline. (L2-049)

### Motion

- **AC-21** Given `prefers-reduced-motion: reduce`, when the sheet opens, then it appears without the settle animation and links change colour without transition. (L2-050)

### Content

- **AC-22** Given the en-CA catalogue, when the header renders, then every label (nav, "Menu", "Close menu", "Dark theme", counts, "Your account, Amara Osei") comes from the catalogue and counts use comma thousands separators ("1,284"). (L2-052)

### Performance

- **AC-23** Given a change to the top bar, theme switch or icon button, when the perf test runs `TopBar`, `TopBarMember`, `ThemeSwitch`, `IconButton` and `DarkTheme` against the base branch, then none is flagged as a possible regression. (L2-048)
- **AC-24** Given the dashboard loads on a mid-range phone, when hydration finishes, then the header has not shifted (it contributes no layout shift). (L2-048)

### Icon button

- **AC-25** Given the say-hello dialog, the "Fall Demo Night" RSVP toast and the account banner, when they render, then their close controls are `button.icon-btn` elements named "Close dialog", "Dismiss notification" and "Dismiss banner", each with an `aria-hidden` icon and no other text. (L2-050)
- **AC-26** Given a small icon button ("Close dialog") at 360 px, when its hit area is measured, then it is at least 44 × 44 px while the visible circle stays `--space-8`. (L2-049)
- **AC-27** Given an icon button with `count` 3 and then 0, when it renders, then the badge reads "3" and is `aria-hidden`, and at 0 no badge exists. (L2-027)
- **AC-28** Given a disabled icon button, when Amara tabs past it or hovers it, then it is skipped and shows no hover fill. (L2-050)

## Implementation notes

Gaps between the built `bn-top-bar` (`top-bar.ts`, `top-bar.html`, `top-bar.css`) and this CRD:

- Navigation sheet uses the native `popover` attribute and `popovertarget`; replace with a CDK
  `Overlay` (`NavigationSheet` in the `adapt-responsive-layout` design) with backdrop
  `.backdrop`, global position (top, inset `--space-3`), `FocusTrap`, `restoreFocus`, and a
  `div.nav-sheet[role=dialog][aria-modal]` wrapper. Move `.nav[popover]` styles to `.nav--sheet`.
- Menu button lacks `aria-expanded` and `aria-controls`.
- Breakpoint is 64 rem in `top-bar.css`; use `media-up(LG)` (992 px) and `BREAKPOINTS.LG`.
- Brand link is hard-coded to `/`; add `brandLink`.
- No member actions: add `member`, `counts`, `memberLinks`, the four member labels, `accountMenu`,
  and the `.matches-link`, `.icon-btn`, `.icon-btn__count`, `.avatar-btn` styles (from
  components.css) to `top-bar.css`; render the actions slot only for visitors.
- No theme switch: create `frontend/projects/components/src/lib/theme-switch/` (`ThemeSwitch`,
  selector `button[bn-theme-switch]`, host classes `icon-btn theme-switch`, `aria-pressed` from
  `ThemeService.effective()`), render it in `.header__actions` before the menu button, and export it.
- Outputs `menuOpened` / `menuClosed` are new.
- No icon button exists: create `frontend/projects/components/src/lib/icon-button/` (`IconButton`,
  selector `a[bn-icon-button], button[bn-icon-button]`, host class `icon-btn` plus
  `icon-btn--sm`, `aria-label` from `label`, `aria-pressed` from `pressed`), move the `.icon-btn`,
  `.icon-btn__count` and small-size rules from components.css into its styles, export it, and add
  `IconButton.ts` (the Notifications link with count 3) to the perf-test scenarios. The header, the
  theme switch, [dialog](dialog.md), toast and banner use it.
- `@angular/cdk` is not yet in `frontend/package.json`; add it (matching the Angular major) before
  the navigation sheet, the menu trigger or `BreakpointObserver` are built.
- Add `TopBarMember.ts` and `ThemeSwitch.ts` to the perf-test scenarios and `index.ts`.
- `NavItem` stays exported from `top-bar.ts` (the footer and sidebar navigation reuse it).

## Decisions

- **D-1** *At which width does the navigation go inline?* 992 px (L2 LG class, the breakpoint
  module of `adapt-responsive-layout`). The mocks use 64 rem (1024 px); L2-049 only fixes "below
  576 px behind a menu button", and the design leaves 576–1024 open. 992 keeps one breakpoint set
  across components, and the parity widths agree.
- **D-2** *Where is the theme switch, which the mocks never draw?* An `.icon-btn` in
  `.header__actions`, just before the menu button, for visitors and members alike, so it exists on
  every page (L2-051 AC2). The `switch-theme` design asks for it in the shell; the header mocks and
  their visual baselines need the button added.
- **D-3** *Light/dark only, or a "system" choice too?* Light and dark only: L2-051 AC2 says
  "toggled". "System" stays the state before the first choice (`ThemeService`).
- **D-4** *Changing label ("Switch to dark theme") or `aria-pressed`?* A constant name, "Dark
  theme", with `aria-pressed`. The `switch-theme` design suggests both, but a label that flips
  while `aria-pressed` also flips reads as "Switch to light theme, pressed", which contradicts itself.
- **D-5** *Accessible names of the unread links?* "3 unread notifications" and "1 unread message",
  as L2-027 AC2 states, instead of the mocks' "Notifications, 3 unread". With no unread items they
  are "Notifications" and "Messages".
- **D-6** *"With search" and "compact" variants?* Not built: no screen uses them; the directory
  search lives in the page ([search box](search-filter-toolbar.md)).
- **D-7** *Is the navigation sheet modal?* Yes: it has a backdrop over the page, so it follows the
  modal dialog rules (L2-050 AC2 allows a trap only for modal dialogs), as the
  `adapt-responsive-layout` design's `NavigationSheet` does.
- **D-8** *Is the avatar a link to a menu page (mock) or a button?* A button with
  `aria-haspopup="menu"`; the mock links to the account-menu mock file only because mocks are
  static.
- **D-9** *Hide the matches link at zero?* Yes. "0 new matches" is noise; matching itself stays in
  the navigation.
- **D-10** *Is "Sign in" reachable below 992 px?* Not from the header, as in every public mock;
  "Join Banaro" and the join page link to sign-in. The CRD keeps the mocks' layout.
- **D-11** *Where does the theme switch go when the row is full?* Below 480 px (where the menu
  label already hides) it moves into the navigation sheet as a labelled quiet button: rendered at
  320 px, the signed-in row with the switch pushes "Menu" out of view. The switch keeps the same
  name and `aria-pressed` in both places.
- **D-12** *Who owns `.icon-btn`?* This CRD, as `bn-icon-button`, at the lead's request: the
  button CRD covers `.btn` only, and the header holds most of the 400-odd icon-button uses. One
  component keeps the required accessible name, the count badge and the small size consistent for
  dialogs, toasts and banners.
- **D-13** *Why a `sm` size?* The dialog and toast close controls are drawn at `--space-8` in every
  mock; the size keeps that look while D-5 of the dialog CRD grows the hit area below 576 px.
