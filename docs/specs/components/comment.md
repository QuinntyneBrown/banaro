# Feedback comment

| Field | Value |
|---|---|
| Selector | `li[bn-comment]` |
| Library path | `frontend/projects/components/src/lib/comment/` |
| Status | planned |
| Traces to | L2-013, L2-016, L2-030, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`comment.html`](../../design-system/components/comment.html) (page "Feedback comment") |
| Source mocks | [`pages/project-detail/default`](../../mocks/pages/project-detail/default.html), [`pages/project-detail/own`](../../mocks/pages/project-detail/own.html), [`dialogs/give-feedback/default`](../../mocks/dialogs/give-feedback/default.html), [`dialogs/give-feedback/busy`](../../mocks/dialogs/give-feedback/busy.html), [`dialogs/offer-to-help/default`](../../mocks/dialogs/offer-to-help/default.html) |
| Rendering | [`comment.html`](comment.html) |

## Purpose and scope

A feedback comment is one builder's note on a project: their face, their name linking to their
profile, what kind of note it is ("Question", "Suggestion", "Encouragement"), when they wrote it,
and the words. On the owner's view, comments posted since they last looked are tinted and marked
"New", and the owner can reply once under each and hide a comment from the public.

Use the [message-thread](message-thread.md) for private conversations and the
[notification-item](notification-item.md) for "Hannah Kowalski commented on Harvest".

Out of scope:

- The list `ol.comments`, "Showing the five most recent", "Show 36 earlier comments", the "4 new
  comments since you last looked" strip and the empty state "Be the first to say something":
  project-detail page content (L2-013).
- Writing feedback: the `give-feedback` [dialog](dialog.md).
- Writing a reply and confirming a hide: the page opens a dialog for each (AGENTS.md: no inline
  forms in pages).
- Which comments are "new" (L2-030 AC9) and who may see a hidden comment (L2-016 AC4): the API.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/project-detail/default` (Psalter, 5 comments); also behind every `dialogs/give-feedback/*` and `dialogs/offer-to-help/*` state | default | Hannah Kowalski, "Question", "2 days ago", body; Noah Fischer "Suggestion"; Grace Liu "Encouragement" (sage pill); Marcus Bennett; Amara Osei | default | canvas, `ol.comments` |
| `pages/project-detail/own` (Harvest, 5 comments) | `isNew` on four | Noah "Today · New", Ruth "Yesterday · New", Hannah "2 days ago · New", Marcus "3 days ago · New"; Daniel "5 days ago" not new | new, default | canvas |
| Owner reply and hide (L2-016 AC4, no mock) | `[slot=actions]` "Reply", "Hide"; `[slot=reply]` nested owner comment | "Reply" and "Hide" text buttons; reply by Amara with "Owner" pill | owner, replied, hidden | canvas |
| Builder without photo (no mock) | initials | "EN" tile | default | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Item** — host `li.comment` (+ `.comment--new`). Two columns: avatar, content. Top hairline,
   `--space-6` block padding.
2. **Avatar** — `img.avatar` 40 × 40, `alt=""`, `loading="lazy"`; or `span.avatar-initials.tile--{tone}`.
3. **Content** — unclassed `div`.
4. **Head** — `div.comment__head`: `h3.comment__name > a`, `span.pill` (+ `.pill--sage`) for the
   kind, `span.comment__meta` with `time[datetime]`.
5. **Body** — `p.comment__body`, plain text, line breaks preserved.
6. **Actions (owner)** — `div.comment__actions`, `[slot=actions]` (D-3).
7. **Reply (optional)** — `ol.comments.comment__replies` holding one nested `li[bn-comment]` (D-3).

Host: attribute component on the native `li`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `authorName` | `string` | — | yes | Output-encoded. |
| `authorHref` | `string \| null` | `null` | no | Profile link on the name. |
| `photo` | `string \| null` | `null` | no | 40 px avatar URL; null shows initials. |
| `initials` / `tone` | `string` / tone | `''` / `'sage'` | yes when `photo` is null | Initials tile. |
| `kind` | `string \| null` | `null` | no | Translated kind label: "Question", "Suggestion", "Encouragement", "Owner". |
| `kindTone` | `'neutral' \| 'sage'` | `'neutral'` | no | `sage` adds `.pill--sage` (Encouragement, Owner). |
| `datetime` | `string` (ISO 8601) | — | yes | Written on `time[datetime]`. |
| `when` | `string` | — | yes | "2 days ago", "Today", "1 week ago". |
| `isNew` | `boolean` | `false` | no | Adds `.comment--new` and appends `newLabel` to the meta. |
| `newLabel` | `string` | — | yes when `isNew` | "New"; rendered after " · ". |
| `hidden` | `boolean` | `false` | no | The comment is hidden from the public; shows `hiddenLabel` as a pill and mutes the body (D-4). |
| `hiddenLabel` | `string` | — | yes when `hidden` | "Hidden from the public". |
| `body` | `string` | — | yes | 10–1,000 characters (L2-016), plain text. |
| `headingLevel` | `3 \| 4` | `3` | no | 4 for a nested reply. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Reply and Hide are projected buttons whose handlers open dialogs. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=actions]` | `button[bn-button]` text sm: "Reply", "Hide" / "Show again" | Owner only; omit the slot otherwise. |
| `[slot=reply]` | one `li[bn-comment]` | The owner's single reply (once per item). Rendered inside `ol.comments.comment__replies`. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | `li.comment` | Any comment |
| New | `.comment--new` + "· New" in meta | Posted by someone else since the owner last opened the feedback |
| Owner | projected actions | The project owner's view |
| Reply | nested, `headingLevel` 4, kind "Owner" | The owner's reply under a comment |
| Hidden | hidden pill, muted body | A comment the owner hid, seen by its author or an administrator |

One size; the body's measure is capped at `--size-footer-land-max-width-17`.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Hairline top rule | Name heading, kind, time, body read in order |
| New | `isNew` | `--color-accent-subtle` fill, `--radius-md`, `--space-4` inline padding; meta "Today · New" | "New" read as text, not colour alone |
| Name link hover / focus | `:hover`, `:focus-visible` | Link colours, shared focus ring | Link named by the author |
| Hidden | `hidden` | Pill "Hidden from the public"; body in `--color-fg-subtle` | Pill read before the time |
| Replied | `[slot=reply]` filled | Nested comment indented by the avatar column | Reply read after the comment |
| Long body | 1,000 characters | Wraps at the measure; never truncated | Full text |

## Markup

```html
<!-- rendered: default (pages/project-detail/default) -->
<li class="comment">
  <img class="avatar" src="/media/hannah-kowalski.jpg" width="40" height="40" alt="" loading="lazy">
  <div>
    <div class="comment__head">
      <h3 class="comment__name"><a href="/builders/hannah-kowalski">Hannah Kowalski</a></h3>
      <span class="pill">Question</span>
      <span class="comment__meta"><time datetime="2026-10-07T14:20-04:00">2 days ago</time></span>
    </div>
    <p class="comment__body">I sat in on three of your beta users' first sessions in my head just from the onboarding copy. …</p>
  </div>
</li>
```

```html
<!-- rendered: new, owner view, with a reply (pages/project-detail/own + L2-016 AC4) -->
<li class="comment comment--new">
  <img class="avatar" src="/media/noah-fischer.jpg" width="40" height="40" alt="" loading="lazy">
  <div>
    <div class="comment__head"><h3 class="comment__name"><a href="/builders/noah-fischer">Noah Fischer</a></h3><span class="pill">Suggestion</span><span class="comment__meta"><time datetime="2026-10-09T09:10-04:00">Today</time> · New</span></div>
    <p class="comment__body">Could coordinators see a single week at a glance, grouped by shift? …</p>
    <div class="comment__actions"><button type="button" class="btn btn--text btn--sm">Reply</button><button type="button" class="btn btn--text btn--sm">Hide</button></div>
    <ol class="comments comment__replies">
      <li class="comment"><img class="avatar" src="/media/amara-osei.jpg" width="40" height="40" alt="" loading="lazy"><div><div class="comment__head"><h4 class="comment__name"><a href="/builders/amara-osei">Amara Osei</a></h4><span class="pill pill--sage">Owner</span><span class="comment__meta"><time datetime="2026-10-09T10:02-04:00">Today</time></span></div><p class="comment__body">Yes, that is next. Thank you, Noah.</p></div></li>
    </ol>
  </div>
</li>
```

```html
<!-- consumer -->
<ol class="comments">
  @for (c of feedback(); track c.id) {
    <li bn-comment [authorName]="c.author.name" [authorHref]="'/builders/' + c.author.slug" [photo]="c.author.photo"
        [kind]="'feedback.kind.' + c.kind | t" [kindTone]="c.kind === 'encouragement' ? 'sage' : 'neutral'"
        [datetime]="c.postedAt" [when]="c.postedAt | bnRelative" [isNew]="c.isNew" [newLabel]="'feedback.new' | t"
        [hidden]="c.hidden" [hiddenLabel]="'feedback.hidden' | t" [body]="c.body">
      @if (isOwner()) { <button bn-button variant="text" size="sm" slot="actions" (click)="reply(c)">{{ 'feedback.reply' | t }}</button> }
      @if (isOwner()) { <button bn-button variant="text" size="sm" slot="actions" (click)="toggleHidden(c)">{{ (c.hidden ? 'feedback.show' : 'feedback.hide') | t }}</button> }
      @if (c.reply) { <li bn-comment slot="reply" [headingLevel]="4" … ></li> }
    </li>
  }
</ol>
```

## Design

- Item: grid `auto 1fr`, gap `--space-4`, block padding `--space-6`, top hairline
  `--border-width-hairline` `--color-border-default`.
- Avatar `--space-10` square, `--radius-md`.
- Head: wrap, baseline-aligned, gap `--space-1` `--space-3`. Name `--text-h4`. Meta
  `--text-caption` `--color-fg-subtle`. Pill per the [chip](chip.md) static pill (`.pill`).
- Body: `--space-2` above, `--text-body`, `--color-fg-muted`, max width
  `--size-footer-land-max-width-17`, `white-space: pre-line`.
- New: `--color-accent-subtle`, `--radius-md`, inline padding `--space-4`.
- Actions: `div.comment__actions`, flex, gap `--space-2`, `--space-3` above.
- Replies: `ol.comments.comment__replies`, `--space-4` above; nested item keeps its own rule.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Name link | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Body | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Meta, hidden body | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| New fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Kind pill | `--color-bg-subtle` / `--color-fg-muted` | oat 200 / stone 700 | night 800 / night 200 |
| Sage pill | `--color-accent-subtle` / `--color-fg-accent` | sage 50 / sage 700 | sage 950 / sage 300 |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Body |
| `--color-fg-muted` | `--color-accent-subtle` | 4.5:1 | Body on a new comment |
| `--color-fg-subtle` | `--color-accent-subtle` | 4.5:1 | Meta on a new comment |
| `--color-fg-link` | `--color-accent-subtle` | 4.5:1 | Name on a new comment |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Sage pill |

## Responsive behaviour

- The layout is the same at every width; the head wraps (name, then pill and time on the next
  line) at 320 px; the body wraps; no horizontal scroll.
- Owner actions are text buttons; their target is padded to 44 × 44 CSS px on touch.

## Accessibility

### Role and pattern

List item in an ordered list (newest first). The author name is a heading so readers can step
through comments. The whole comment is never a link (design system).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Author link, then "Reply", then "Hide", then the reply's author link |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation; Reply and Hide open dialogs |

### Focus

Shared ring. After a reply is posted or a comment hidden, focus returns to the "Reply"/"Hide"
button of that comment (dialog rules).

### Labelling

The avatar is decorative (`alt=""`) because the name follows. "New" and "Hidden from the public"
are words. The time is a `time` element with a machine date.

### Announcements

None from the comment; the page's toast announces posted feedback.

### Motion

None.

## Content and internationalisation

- Kinds from the catalogue: "Question", "Suggestion", "Encouragement", and "Owner" for replies.
- Relative times in Canadian English: "Today", "Yesterday", "2 days ago", "1 week ago"; the
  absolute America/Toronto date is in `datetime` (L2-052).
- The body is member text stored as plain text and encoded on output (L2-045); line breaks
  shown, links not auto-linked.
- Translatable: `kind`, `newLabel`, `hiddenLabel`, slot labels. Data: `authorName`, `body`.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Comment.ts` renders Hannah
  Kowalski's "Question" on Psalter, "2 days ago".
- Composite scenarios: `CommentList.ts` renders the five Harvest comments of
  `pages/project-detail/own` (four new, owner actions, one reply); `CommentListDark.ts` renders
  them in `data-theme="dark"`. Iterations tuned in `e2e/perf-test/config/scenario-iterations.mjs`
  to 100–300 ms.
- Regression rule: changes run the perf test against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: avatars declare 40 × 40 and lazy-load.

## Acceptance criteria

### Rendering

- **AC-1** Given Psalter's project page, when the feedback section renders, then Hannah Kowalski's comment shows her avatar, the heading link "Hannah Kowalski", the pill "Question", "2 days ago" and her full feedback text. (L2-013)
- **AC-2** Given Grace Liu's "Encouragement", when it renders, then the pill has the sage style. (L2-013)
- **AC-3** Given Amara posts feedback on Psalter, when the list refreshes, then her comment is first with her name and "Today". (L2-016)
- **AC-4** Given a body containing `<a href="x">click</a>`, when the comment renders, then the characters appear as text and no link is created. (L2-045)

### States

- **AC-5** Given Amara opens Harvest's feedback after four new comments, when they render, then Noah, Ruth, Hannah and Marcus have `.comment--new` and their meta ends "· New", while Daniel's does not. (L2-030)
- **AC-6** Given Amara is the owner, when a comment renders, then "Reply" and "Hide" are present; given another member views it, then neither is. (L2-016)
- **AC-7** Given Amara replied to Noah's comment, when it renders, then her reply appears once, nested under it, with the "Owner" pill and an `h4` name. (L2-016)
- **AC-8** Given Amara hid a comment and its author views the page, when it renders, then it shows "Hidden from the public" and the body in the subtle colour. (L2-016)

### Keyboard and focus

- **AC-9** Given the owner view, when Amara tabs through Noah's comment, then focus moves to the name link, "Reply" and "Hide" with a 2 px ring of at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-10** Given a new comment, when a screen reader reads it, then it hears the author heading, the kind, the time and the word "New" without relying on the tint. (L2-050)

### Theming

- **AC-11** Given the dark theme, when new and default comments render, then fill, rule, link, body and pill colours come from tokens only. (L2-051)
- **AC-12** Given either theme, when measured, then body, meta and name reach 4.5:1 on both the canvas and the new-comment fill. (L2-050)

### Content

- **AC-13** Given a comment posted on Friday 2 October 2026 at 4:20 pm, when it renders on Friday 9 October, then it reads "1 week ago" and `datetime` holds the America/Toronto timestamp. (L2-052)

### Responsive

- **AC-14** Given 320 px, when Hannah's comment renders, then the head wraps, the body wraps without clipping and nothing scrolls horizontally. (L2-049)

### Performance

- **AC-15** Given a change to the comment, when the perf test runs `Comment`, `CommentList` and `CommentListDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/comment/`: `comment.ts` (class `Comment`),
  `comment.css` with `.comment*`, `.pill*`, `.avatar`, `.avatar-initials` and the new
  `.comment__actions` / `.comment__replies` rules.
- Selector `li[bn-comment]`; host classes `comment` and `comment--new`.
- The reply is the same component nested through `[slot=reply]`.
- Perf scenarios as listed under *Performance*.

## Decisions

- **D-1** *The design-system page's "New" and "Owner" variants render the default markup.* New
  follows `pages/project-detail/own` (`.comment--new` and "· New" in the meta); Owner is the
  owner's view with reply and hide actions from L2-016 AC4.
- **D-2** *`span.comment__meta` holds plain text in the mock; the design system asks for a time
  element.* The meta wraps a `time[datetime]`; the visible text is unchanged.
- **D-3** *L2-016 AC4 requires a once-per-item threaded reply and hiding, but no mock shows
  either.* Two new elements: `div.comment__actions` for the owner's text buttons and
  `ol.comments.comment__replies` for the reply, which reuses the comment markup with an "Owner"
  sage pill. Raised with the lead so a mock can be added.
- **D-4** *How does a hidden comment look to its author?* A neutral pill "Hidden from the
  public" in the head and the body in `--color-fg-subtle`; the public list omits it (API).
