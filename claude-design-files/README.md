# Handoff: Local Ollama Chat Frontend

## Overview

A lightweight browser-based chat UI for a locally-running Ollama LLM instance. Single-column, dark-by-default, no streaming (v1). Renders assistant responses as markdown with syntax-highlighted code blocks and per-block Copy / Download actions. Single user, single conversation, history in `localStorage`.

This handoff covers **Direction B — "Clean utility"**: a neutral, soft-chromed dark interface with sans-serif UI text, mono inside code, periwinkle accent. The Terminal and Editorial directions in the source canvas are exploration only and should be ignored.

## About the Design Files

The HTML/JSX in `reference/` is a **design reference**, not production code to copy.

It was built as a Babel-inline React prototype to make the look + behavior tangible. The target architecture (from your `FRONTEND_ARCHITECTURE.md`) is **plain HTML / CSS / vanilla JS, no build step**, with `marked.js` + `highlight.js` from CDN.

**Your job:** recreate the visuals and interactions from `reference/Local Ollama Chat.html` (Artboard "Active conversation · tweakable") inside the planned `static/index.html` + `static/style.css` + `static/app.js` structure. Use the existing libraries (`marked`, `highlight.js`) — don't port the prototype's hand-rolled markdown/tokenizer.

## Fidelity

**High-fidelity.** Exact colors, type scale, spacing, radii, and copy below. Recreate pixel-perfectly. Token names are suggestions — pick whatever fits your CSS conventions, but values should match.

## Screens / Views

The app is a single SPA view with three logical regions stacked vertically: **Header → Stream → Composer**. Max content width 760px, centered. Overall layout is a column flex at `100vh`.

### Header (height ~58px)

Flex row, `padding: 14px 24px`, `border-bottom: 1px solid var(--border-soft)`, background `var(--bg)`.

**Left — brand:**
- 26×26 rounded square, `border-radius: 7px`, `background: linear-gradient(135deg, oklch(0.78 0.12 252), oklch(0.62 0.16 270))`. Centered glyph "O", `font: 700 13px sans`, color `#0b0c0f`.
- Gap 12px to a two-line text stack:
  - Title: `Ollama Chat` — `font: 600 15px / 1 sans`, color `var(--fg)`, `letter-spacing: -0.1px`
  - Sub: `Local · localhost:11434 · connected` — `font: 400 12.5px sans`, color `var(--fg-faint)`, `margin-top: 1px`

**Right — actions** (gap 10px):
- **Model pill** (button). `padding: 7px 12px 7px 10px`, `border-radius: 999px`, `background: var(--surface)`, `border: 1px solid var(--border)`, `font: 500 13px sans`. Contents in order: 7×7 green dot `oklch(0.74 0.16 145)` (= "Ollama reachable"), model name (e.g. `qwen2.5-coder:7b`), size badge (`4.7 GB`) in `var(--fg-faint)`, `▾` caret. Clicking opens the model dropdown — see *Interactions*.
- **Copy-last icon button** (34×34, `border-radius: 8px`, same surface+border, `color: var(--fg-dim)`). Lucide-style clipboard icon, 15×15, stroke 2. Disabled (`opacity 0.5, cursor: not-allowed`) when no assistant message exists.
- **Clear-history icon button** (same shell). Lucide-style trash icon.

### Stream (flex: 1, scrollable)

`padding: 28px 24px 12px`. Inner column `max-width: 760px`, `margin: 0 auto`, vertical `gap: 18px`. Auto-scroll to bottom on new message.

**User message:**
- Right-aligned flex row; child bubble: `max-width: 78%`, `padding: 10px 14px`, `border-radius: 14px 14px 4px 14px`, `background: oklch(0.36 0.07 252)`, `color: #ecf0ff`, `font: 400 14.5px / 1.5 sans`, `white-space: pre-wrap`.

**Assistant message:**
- Full-width column, `gap: 8px`.
- **Byline** (flex row, gap 8, `font: 400 12.5px sans`, color `var(--fg-dim)`):
  - 22×22 avatar: `border-radius: 6px`, `background: var(--surface)`, `border: 1px solid var(--border)`, centered 11×11 filled circle in `var(--fg-dim)`.
  - Model name in `var(--fg)`, weight 500.
  - `· 14:21` in `var(--fg-faint)`.
- **Body** — rendered markdown, color `var(--fg)`:
  - Paragraphs: `margin: 0 0 12px`, `font: 400 14.5px / 1.55 sans`.
  - Bold: `font-weight: 600`.
  - Inline code: `font: 400 0.86em mono`, `background: var(--surface)`, `border: 1px solid var(--border)`, `padding: 1.5px 6px`, `border-radius: 5px`.
  - Lists: `padding-left: 22px`, `margin: 0 0 12px`. Items `margin: 3px 0`. Default bullet ok.
  - Code blocks — see next.

**Code block:**
- Wrapper: `margin: 12px 0`, `background: var(--inset)`, `border: 1px solid var(--border)`, `border-radius: 10px`, `overflow: hidden`.
- **Header bar**: `padding: 9px 12px`, `background: var(--surface)`, `border-bottom: 1px solid var(--border)`, flex row space-between, `font-size: 12.5px`.
  - Left: language tag — pill `background: var(--surface-hi)`, `border: 1px solid var(--border)`, `padding: 2px 8px`, `border-radius: 5px`, `font: 500 11.5px sans`, color `var(--fg)`. Use the label map below. Then 10px gap → filename hint in mono 11.5px, `color: var(--fg-faint)` (e.g. `main.py`).
  - Right: two icon-text buttons, gap 4. Both `border: none`, `background: transparent`, `padding: 4px 8px`, `border-radius: 6px`, `font-size: 12px`, icon 13×13 stroke 2:
    - **Copy** — clipboard icon + label, `color: var(--fg-dim)`.
    - **Download** — down-arrow-to-tray icon + label, `color: var(--accent)`, `font-weight: 500`.
- **`<pre>`**: `padding: 14px 16px`, `font: 400 12.5px / 1.6 mono`, color `var(--fg)`, horizontal-scroll on overflow.
- Syntax highlighting via `highlight.js`. Use the `atom-one-dark` stylesheet. Inline-tweak token colors to match the prototype's palette:
  - keyword `#ff7b72`, string `#a5d6ff`, comment `#6e7681` italic, number `#f7c873`, function/builtin `#d2a8ff`.

**Loading / status indicator** (replaces the assistant message body while waiting):
- Inline pill: flex row gap 8, `background: var(--surface)`, `border: 1px solid var(--border)`, `padding: 8px 14px`, `border-radius: 999px`. 7×7 dot `background: var(--accent)`, animating opacity 1 → 0.4 → 1 over 1.4s. Text 13px `var(--fg-dim)`. Status text cycles every 1.6s: `Thinking…` → `Reading sources…` → `Drafting reply…` → `Polishing…`.

### Composer (bottom, not pinned-to-keyboard since desktop-only)

`padding: 12px 24px 18px`, `background: var(--bg)`, no top border. Inner `max-width: 760px`, `margin: 0 auto`.

**Input box** (flex column, gap 8):
- `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 14px`, `padding: 12px 12px 8px 16px`, `box-shadow: 0 1px 0 rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.25)`.
- **Textarea** (row 1): transparent, no border/outline, `font: 14.5px sans`, `color: var(--fg)`, `resize: none`, `min-height: 24px`, `line-height: 1.5`. Auto-grow with content up to `max-height: 240px`, then internal scroll. Placeholder: `Message Ollama…` in `var(--fg-faint)`.
- **Action row** (row 2, flex space-between):
  - Left: two ghost icon buttons (30×30, `border-radius: 8px`, transparent, color `var(--fg-dim)`, hover `background: var(--surface-hi)`):
    1. Paperclip — placeholder slot, no v1 behavior, can be omitted if you'd rather not stub it.
    2. Three horizontal lines — opens an inline "system prompt" sheet (v2; can be stubbed inert).
  - Right: **Send** button. `background: var(--accent)`, `color: var(--accent-ink)`, `border: none`, `padding: 8px 14px`, `border-radius: 999px`, `font: 600 13px sans`, gap 6, with a 13×13 right-arrow icon (stroke 2.4). Disabled state: `opacity 0.5, cursor: not-allowed` while a request is in-flight or the textarea is empty/whitespace-only.

**Hint row** (below input, `margin-top: 8px`, `padding: 0 4px`, flex space-between, `font: 11.5px sans`, color `var(--fg-faint)`):
- Left: `Press ⌘⏎ to send · ⇧⏎ for newline`
- Right: `Switching models starts a new chat`

### Model dropdown (opened from the pill)

Popover anchored under the pill, `top: calc(100% + 6px)`, `right: 0`. `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 12px`, `padding: 6px`, `box-shadow: 0 12px 32px rgba(0,0,0,0.35)`, `min-width: 320px`. One row per model: `padding: 8px 10px`, `border-radius: 8px`, hover `background: var(--surface-hi)`. Row layout: green dot (8px) · model name (`font: 500 13.5px sans`) · pushed-right size badge (`12px var(--fg-faint)`). Selected row shows a 14×14 check on the far left in `var(--accent)` instead of the dot.

Below the list, a flush separator `1px solid var(--border)` and a warning row: 12.5px `var(--fg-dim)`, `padding: 8px 10px`, text `Switching models clears the current chat.`

### Empty state (no messages)

Centered in the stream area, vertically + horizontally. Stack, `gap: 12px`, `text-align: center`, `color: var(--fg-dim)`:
- Brand mark (40×40, same gradient as header) centered.
- `font: 600 22px sans` color `var(--fg)`: `Ask anything.`
- `font: 14px / 1.55 sans` color `var(--fg-dim)` max-width 360px: `Connected to Ollama on localhost:11434. Pick a model from the pill above and send a message — your conversation stays on this machine.`
- 24px gap, then three "Try one of these" suggestion chips (flex wrap, gap 8). Each chip: `padding: 8px 12px`, `border: 1px solid var(--border)`, `border-radius: 999px`, `font: 13px sans`, `color: var(--fg)`, `background: var(--surface)`, hover `background: var(--surface-hi)`. Suggested copy: `Explain this stack trace`, `Write a Python script to…`, `Summarize my notes`.

### Error states

Inline cards in the stream, never a modal. Each card: `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 12px`, `padding: 18px 20px`, flex row gap 16. Left icon block 40×40 `border-radius: 10px` with kind-specific tinted bg/fg (values below). Body column gap 6.

Title row: `font: 600 15px sans` color `var(--fg)`, with a monospace code badge on the right (`background: var(--inset)`, `border: 1px solid var(--border)`, `padding: 2px 8px`, `border-radius: 5px`, `font: 11.5px mono`, `color: var(--fg-dim)`).

Message: 13.5px `#c8cacd`, `line-height: 1.55`.

Optional `<pre>`-style hint: `font: 12.5px mono`, `background: var(--inset)`, `border: 1px solid var(--border-soft)`, `padding: 8px 10px`, `border-radius: 6px`, `color: var(--fg-dim)`.

Actions row (margin-top 6, gap 8). Primary button: `background: var(--accent)`, `color: var(--accent-ink)`, `border: none`, `padding: 6px 12px`, `border-radius: 8px`, `font: 600 12.5px sans`. Secondary: same shape, `background: transparent`, `border: 1px solid var(--border)`, `color: var(--fg)`.

**1. Ollama offline** — icon tint `bg: oklch(0.28 0.08 25)`, `fg: oklch(0.78 0.16 25)`. Icon: wifi-with-slash. Title `Can't reach Ollama`. Badge `ECONNREFUSED · localhost:11434`. Body: `Ollama isn't responding on the default port. Start it from the terminal and try again — the page will pick up automatically.` Hint code: `$ ollama serve`. Buttons: `Retry connection` (primary), `Open Ollama docs` (secondary).

**2. Timeout** — icon tint `bg: oklch(0.30 0.08 80)`, `fg: oklch(0.82 0.14 80)`. Icon: clock. Title `Ollama took too long`. Badge `TIMEOUT · 120s`. Body: `<bold model name> didn't finish within the timeout window. The conversation is preserved — you can resend the last message or switch to a smaller model.` Buttons: `Retry request`, `Switch model`, `Increase timeout`.

**3. File too large** — icon tint `bg: oklch(0.28 0.06 280)`, `fg: oklch(0.80 0.12 280)`. Icon: file with warning. Title `File exceeds the 10 MB limit`. Badge `413 · <actual size>`. Body: `<code filename> is too large to download in v1. Copy the contents to clipboard or split into smaller blocks.` Buttons: `Copy to clipboard`, `Split into parts`.

### Clear-history confirmation

Use the browser-native `confirm()` for v1 — keeps scope small. Message: `Clear the current conversation? This can't be undone.`

### Toasts (copy / download / sent success)

Floating pill, fixed `bottom: 80px`, horizontally centered. `background: var(--surface)`, `border: 1px solid var(--border)`, `color: var(--fg)`, `font: 12.5px sans`, `padding: 8px 14px`, `border-radius: 999px`, `box-shadow: var(--shadow)`. Optional 7px accent dot on the left. Auto-dismiss after 1200ms with a fade. Copy: `Copied to clipboard` / `Downloaded <filename>` / `Sent`.

## Interactions & Behavior

- **Send** — fires on Send button click or `⌘⏎` / `Ctrl⏎` inside textarea. `⇧⏎` inserts a newline. Empty/whitespace input is a no-op (button disabled). Disable send + show status pill while request is in-flight.
- **Model switch** — confirms (`Switching models will start a new chat. Continue?`) only if there are existing messages. On confirm: clear `localStorage.chatHistory`, clear in-memory state, render empty state. Persist selected model to `localStorage.selectedModel`.
- **Copy last response** (header) — copies the last assistant message's raw markdown to clipboard. Toast `Copied to clipboard`. Disabled if no assistant message.
- **Clear history** (header) — `confirm()` → wipe `localStorage.chatHistory` and re-render empty state.
- **Per-block Copy** — copies the raw code (no fences) to clipboard. Toast.
- **Per-block Download** — POST to `/api/download` with `{ content, filename }`. Filename is derived from the fence language; see `suggestedFilename` in `reference/app/shared.jsx`. On 413, show the *File too large* error card inline (don't replace the response; append below it). On any other failure, show the same card pattern with a generic title.
- **Auto-scroll** — `messagesContainer.scrollTop = messagesContainer.scrollHeight` after each message append. Don't use `scrollIntoView`.
- **Persistence** — save chat history to `localStorage` after every state change (user send AND assistant receive). On page load: hydrate history first, then fetch `/api/models` and populate the dropdown.
- **Animations** — status dot pulse 1.4s ease-in-out infinite; toast fade-in 150ms / fade-out 250ms; no other animations.

## State Management

Single in-memory object (matches the architecture doc's `appState`):

```js
{
  messages: [{ role, content, timestamp, modelUsed }],
  selectedModel: 'qwen2.5-coder:7b',
  isLoading: false,
  loadingPhase: 0, // 0..3, cycled by setInterval while isLoading
  models: [{ name, size, modified_at }],
  modelMenuOpen: false,
}
```

Mirrors to `localStorage`:
- `chatHistory` → `messages` (JSON-stringified)
- `selectedModel` → `selectedModel` (string)

## Design Tokens

### Colors (dark default — only theme to ship in v1)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#161719` | App background |
| `--surface` | `#1c1e22` | Cards, header buttons, model pill, code-block header, composer box |
| `--surface-hi` | `#22252a` | Hover background on surface elements; language tag bg |
| `--inset` | `#0f1114` | Code block body, error-card monospace hint |
| `--border` | `#2a2d33` | Standard 1px border |
| `--border-soft` | `#222428` | Header bottom, dividers between rows |
| `--fg` | `#ebecee` | Primary text |
| `--fg-dim` | `#9aa0a6` | Secondary text, icon defaults |
| `--fg-faint` | `#5b6066` | Tertiary text (timestamps, hints, sizes) |
| `--accent` | `oklch(0.78 0.12 252)` | Send button bg, download button text, primary action |
| `--accent-ink` | `#0e1116` | Text on accent backgrounds |
| `--user-bubble` | `oklch(0.36 0.07 252)` | User message background |
| `--user-bubble-fg` | `#ecf0ff` | User message text |
| `--shadow` | `0 1px 0 rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.25)` | Composer box, toast |

Connection-status green (model pill dot, success toast dot): `oklch(0.74 0.16 145)`.

Syntax (override on top of atom-one-dark): keyword `#ff7b72`, string `#a5d6ff`, comment `#6e7681` italic, number `#f7c873`, function/builtin `#d2a8ff`.

### Typography

- **Sans** (UI): `'Helvetica Neue', Helvetica, 'Segoe UI', sans-serif`.
- **Mono** (code, filenames, error badges): `'JetBrains Mono', ui-monospace, Menlo, monospace`. Load JetBrains Mono via Google Fonts: weights 400, 500.

Scale:
| Use | Size / line-height / weight |
|---|---|
| Title (brand) | 15 / 1 / 600 |
| Body (msg, paragraphs) | 14.5 / 1.55 / 400 |
| Secondary (byline, hints) | 12.5 / 1.5 / 400 |
| Caption (tiny meta) | 11.5 / 1 / 400 |
| Code | 12.5 / 1.6 / 400 mono |
| Inline code | 0.86em / inherit / 400 mono |
| Empty-state H1 | 22 / 1.2 / 600 |
| Error title | 15 / 1.4 / 600 |

### Spacing scale

`4, 6, 8, 10, 12, 14, 18, 24, 28, 36`. Stick to these. Max content width 760px.

### Radii

`5 / 6 / 7 / 8 / 10 / 12 / 14 / 999`. Components:
- Buttons in code-block header: `6`
- Header icon buttons: `8`
- Cards & error cards: `12`
- Composer input box: `14`
- User bubble: `14 14 4 14`
- Code block wrapper: `10`
- Model pill, send button, toast, status pill, suggestion chips: `999`
- Brand mark: `7`
- Avatar: `6`
- Code language tag: `5`

### Shadows

Only two:
- `--shadow` (composer box, toast) — see token table.
- Dropdown: `0 12px 32px rgba(0,0,0,0.35)`.

## Assets

- **Fonts** — Helvetica Neue is system-supplied; load JetBrains Mono from Google Fonts (`weight: 400, 500`).
- **Icons** — all inline SVG, stroke 2 (or 2.4 for the Send arrow), 13×13 or 15×15. The set used:
  - Clipboard (copy)
  - Download (arrow into tray)
  - Trash (clear history)
  - Caret-down (`▾` glyph is fine)
  - Send (right arrow)
  - Paperclip (composer left, optional)
  - Three horizontal lines (composer left, optional)
  - Wifi-slash (error icon, offline)
  - Clock (error icon, timeout)
  - File-with-warning (error icon, oversize)
  - Filled circle (assistant avatar)
  - Check (selected model row)

Lucide / Feather icons match the style; either is fine.

### Language tag map

Use the `LANG_LABEL` and `LANG_TO_EXT` tables in `reference/app/shared.jsx` verbatim:
- python/py → `Python` / `.py`
- javascript/js → `JavaScript` / `.js`
- typescript/ts → `TypeScript` / `.ts`
- bash/sh/shell → `Bash` or `Shell` / `.sh`
- json/yaml/html/css/go/rust/sql/md — labeled and extension-mapped as listed in `shared.jsx`.
- Unknown language → label `text`, extension `.txt`, ask user before download (the architecture doc calls this out).

Filename suggestion: `main.py` for Python, `script.sh` for shell, `snippet.<ext>` otherwise. Multiple blocks of the same language in one response → suffix index: `main-2.py`.

## Files

The bundled reference includes:

```
reference/
  Local Ollama Chat.html       ← open this; it's the canvas with all directions
  design-canvas.jsx            ← canvas chrome (you can ignore for build)
  tweaks-panel.jsx             ← Tweaks panel (exploration only — don't ship)
  app/
    shared.jsx                 ← MOCK_CONVERSATION, language maps, filename rules
    clean.jsx                  ← THE canonical direction; reference for visuals
    tweakable.jsx              ← Tweaks wrapper for clean.jsx; exploration only
    errors.jsx                 ← Error-card layouts
```

When you open `Local Ollama Chat.html`, the artboard labeled **"Active conversation · tweakable"** is the canonical mock. The Terminal and Editorial artboards are exploration; ignore.

The "Tweaks" panel (theme, accent, font, density) is exploration — **v1 ships dark + periwinkle + sans + regular density only**. Don't carry the panel into production.

## Out of scope for v1 (confirms the PRD)

- Streaming responses
- Mobile / responsive
- Multi-conversation sidebar
- Light theme (the Tweaks panel shows one, but v1 is dark-only)
- Custom model parameters (temperature, etc.)
- Auth / multi-user
