# Code block

| Field | Value |
|---|---|
| Selector | `bn-code-block`, `code[bn-code]` |
| Library path | `frontend/projects/components/src/lib/code-block/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`code-block.html`](../../design-system/components/code-block.html) |
| Source mocks | None: the design system marks the code block a core documentation extension that no mock uses |
| Rendering | [`code-block.html`](code-block.html) |

## Purpose and scope

The code block shows code and token names as selectable text: a token name
inline in a sentence ("Use `--color-accent` for the primary fill"), or a short
complete example in a scrollable well with a "Copy code" button that confirms
in a polite live region. It exists for documentation surfaces — the design
system, the perf-test app's scenario notes and any future admin help — not for
member-facing screens.

Use plain text for member copy. The server-error page's "Reference ID" is a
plain `<code>` owned by [error-page](error-page.md) (D-2).

Out of scope:

- Syntax highlighting (D-3).
- Reading code from files: the consumer passes the string.
- Toasts: the copy confirmation is inline, not a [toast](toast.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Design system *Inline* | inline | `--color-accent` in "Use … for the primary fill." | default | surface |
| Design system *Block* | block, no copy | `<button class="btn btn--primary">Say hello</button>` | default | surface |
| Design system *Copy* | block with copy | same, "Copy code" | default, copied | surface |
| Design system component pages' *Code* sections (one per component) | block | the component's BEM markup | default | surface |
| Product screens | none | — | — | — |

## Anatomy

**Inline** — `code.code-block` (the host `code[bn-code]`), inline with a
tinted well.

**Block**

1. **Container** — the host `bn-code-block`, a grid with `--space-2` gap.
2. **Well** — `pre.code-block` holding `code`: `--space-4` padding,
   `--color-bg-subtle`, `--radius-md`, `overflow-x: auto`, `--text-code`.
3. **Copy button (optional)** — `button.btn.btn--quiet` "Copy code".
4. **Feedback** — `span.field__help` with `role="status"`, empty until a copy
   finishes.

## API

### Inputs — `bn-code-block`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `code` | `string` | — | yes | Rendered as text inside `pre > code`; whitespace kept; never as HTML. |
| `label` | `string \| null` | `null` | no | Language or purpose ("HTML"); when set, the well becomes `role="region"` with `aria-label` "{label} example" so a scrollable well can take focus (D-4). |
| `copyable` | `boolean` | `false` | no | Shows the copy button. |
| `copyLabel` | `string` | — | when `copyable` | "Copy code". |
| `copiedMessage` | `string` | — | when `copyable` | "Copied to the clipboard." |
| `copyFailedMessage` | `string` | — | when `copyable` | "Couldn't copy. Select the code and copy it yourself." |

### Inputs — `code[bn-code]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| None | — | — | — | Adds the `code-block` class; content is the projected text. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `copied` (`bn-code-block`) | `boolean` | After a copy attempt: `true` when the clipboard write resolved, `false` when it rejected. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None (`bn-code-block`) | — | Code comes from `code` so escaping is guaranteed. |
| default (`code[bn-code]`) | text | A token name or short identifier. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Inline | `code.code-block` | Names inside a sentence. |
| Block | `pre.code-block` | Complete short examples. |
| Copy | block + `copyable` | Examples a reader is expected to paste. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content; long lines scroll | `--space-4` (block) | `--text-code` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Well with code; empty feedback | Code read as text |
| Copy hover / focus / active | button states | [button](button.md) quiet styles; focus ring | Button "Copy code" |
| Copied | clipboard write resolved (`data-state="copied"` on the host) | Feedback text "Copied to the clipboard." for 4 s, then cleared | Polite announcement via `role="status"`; focus stays on the button |
| Copy failed | clipboard write rejected | Feedback "Couldn't copy. Select the code and copy it yourself." until the next attempt | Polite announcement; never reports "Copied" |
| Overflowing | line longer than the well | Horizontal scroll inside the well | Well focusable when labelled (D-4) |
| Disabled | not supported | — | The design system's states table renders none |

## Markup

```html
<!-- rendered: inline -->
<p>Use <code bn-code class="code-block">--color-accent</code> for the primary fill.</p>
```

```html
<!-- rendered: block with copy, after a successful copy -->
<bn-code-block data-state="copied">
  <pre class="code-block" role="region" aria-label="HTML example" tabindex="0"><code>&lt;button class="btn btn--primary"&gt;Say hello&lt;/button&gt;</code></pre>
  <button bn-button class="btn btn--quiet" type="button">Copy code</button>
  <span class="field__help" role="status">Copied to the clipboard.</span>
</bn-code-block>
```

```html
<!-- consumer -->
<bn-code-block label="HTML" copyable [code]="snippet" [copyLabel]="t('ds.copy')"
  [copiedMessage]="t('ds.copied')" [copyFailedMessage]="t('ds.copyFailed')" />
```

## Design

- Well: `--space-4` padding, `--color-bg-subtle`, `--radius-md`,
  `overflow-x: auto`, `--text-code` (`--font-family-mono` at
  `--font-size-sm`); `white-space: pre`.
- Inline: same font and fill, padding `0 --space-1`, `--radius-sm` (D-5).
- Container grid gap `--space-2`; the button aligns to the start.
- Feedback `--text-body-sm` in `--color-fg-muted` (`.field__help`).
- No motion beyond the button's own transitions.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Semantic tokens directly. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Well fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Code text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Feedback | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Code |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Feedback |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus on the well or button |

## Responsive behaviour

- No breakpoints. Long lines scroll inside the well; the page never scrolls
  sideways and the code never wraps (wrapping changes meaning).
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices (the copy button).

## Accessibility

### Role and pattern

`pre`/`code` text; a labelled region when scrollable; a native button; a
`role="status"` live region for the result.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Visits the labelled well (if any), then "Copy code". |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Copies and announces the result. |
| Arrow keys | Scroll the focused well. |

### Focus

Focus stays on "Copy code" after copying.

### Labelling

Button text "Copy code"; well labelled "{language} example" when a label is
given.

### Announcements

The result sentence is written into the `role="status"` element (polite), and
cleared after 4 s when it was a success.

### Motion

None.

## Content and internationalisation

- Show complete small examples; name the language when it matters.
- Code is never translated; button and feedback strings are.
- Translatable: `copyLabel`, `copiedMessage`, `copyFailedMessage`, `label`.

## Performance

- Change detection: `OnPush`; the feedback text is a signal.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/CodeBlock.ts`
  renders the copyable "Say hello" button example;
  `frontend/projects/perf-test/src/scenarios/InlineCode.ts` renders
  `--color-accent` inline; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: the feedback element reserves one line of `--text-body-sm` so the
  message appearing does not move content below.
- Weight: uses `navigator.clipboard` only; no highlighter, no copy library.
  Not imported by the public application while no member screen uses it.

## Acceptance criteria

### Rendering

- **AC-1** Given the code `<button class="btn btn--primary">Say hello</button>`, when the block renders, then the well shows those exact characters as text inside `pre.code-block > code`, and no `button` element is created from them. (L2-050)
- **AC-2** Given the sentence "Use --color-accent for the primary fill.", when the inline variant renders the token, then it is a `code.code-block` in `--text-code`. (L2-051)

### States

- **AC-3** Given a copyable block, when the reader presses "Copy code" and the clipboard write succeeds, then the `role="status"` element reads "Copied to the clipboard.", `copied` emits `true`, and focus stays on the button. (L2-050)
- **AC-4** Given the clipboard write is rejected, when the reader presses "Copy code", then the status reads "Couldn't copy. Select the code and copy it yourself.", `copied` emits `false`, and "Copied" is never shown. (L2-050)
- **AC-5** Given the button and feedback copy, when the block renders, then "Copy code" and both messages come from inputs supplied from the translation catalogue, with no English hard-coded in the component. (L2-052)

### Keyboard and focus

- **AC-6** Given a labelled block whose line is wider than the well, when the reader tabs to it, then the well takes focus with the 2 px focus ring and the arrow keys scroll it. (L2-050)

### Theming

- **AC-7** Given the light and dark themes, when the block renders, then code text measures at least 4.5:1 against `--color-bg-subtle`, and colours change only through token values. (L2-051)

### Responsive

- **AC-8** Given a 70-character line at 320 px, when the block renders, then the well scrolls horizontally inside itself and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-9** Given a change to either component, when the `CodeBlock` and `InlineCode` perf-test scenarios run against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/code-block/`:
  `code-block.ts` (class `CodeBlock`, selector `bn-code-block`) and `code.ts`
  (class `InlineCode`, selector `code[bn-code]`); export from `public-api.ts`.
- Copy with `navigator.clipboard.writeText`; guard for a missing API (treated
  as a failure). Clear a success message with a timer cleaned up on destroy.
- Move `.code-block` into the component styles and add the inline padding of
  D-5. Composes [button](button.md) (quiet) and the `.field__help` text style
  of [form-field](form-field.md).
- Scenarios: add `CodeBlock.ts` and `InlineCode.ts`; export from
  `scenarios/index.ts`.

## Decisions

- **D-1** *There is no member-facing use; why build it?* The design system defines it as a documentation extension, so the CRD specifies it completely; it is built only when a documentation surface in the repository needs it, and it must stay out of the public bundle until a member screen does.
- **D-2** *Does the server-error "Reference ID" use it?* No. The mock renders a plain `<code>` with no well, and the error page is already built; adding a tinted well there would break visual parity.
- **D-3** *Syntax highlighting?* None. The design system shows monochrome code, and a highlighter would add weight and colour pairs to verify.
- **D-4** *Is a scrollable well focusable?* Only when it has a `label`, so it can be a named region; an unlabelled well holds short examples that fit. This meets WCAG 2.1.1 for scrollable regions without nameless tab stops.
- **D-5** *Inline code padding?* `components.css` gives `.code-block` `--space-4` padding, which is right for the well but breaks a sentence; the inline variant uses `0 --space-1` with `--radius-sm`.
- **D-6** *Copy feedback wording?* "Copied to the clipboard." and "Couldn't copy. Select the code and copy it yourself." The design system's *Don't* forbids reporting "Copied" on failure but supplies no copy; these follow the product's plain-language voice.
