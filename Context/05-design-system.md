# Design System

Visual direction: a VS Code–style developer IDE — title bar, icon rail, bordered
panels, status bar, dense information, monospace accents. Dark-first, but every theme
ships a fully-specified light variant too.

## Token architecture

Three layers, applied in order, all in `src/styles/`:

1. **Scale** (`tokens.css`) — spacing, type, timing. Fixed.
2. **Palette** (`themes.css`) — raw `R G B` triples per theme, in
   `[data-theme="<id>"]` blocks.
3. **Derived** (`tokens.css`) — the tokens components actually consume,
   composed from the palette *plus the user's appearance settings*.

Palette entries are bare RGB triples rather than hex specifically so every
derived token can apply a user-controlled alpha:

```css
/* themes.css — a theme only ever sets triples */
[data-theme='abyss'] { --elevated-rgb: 5 19 54; }

/* tokens.css — one place composes them with the user's opacity slider */
--bg-elevated: rgb(var(--elevated-rgb) / var(--surface-alpha));
```

That indirection is what makes the glass/translucency settings possible with
zero per-theme work: a theme never knows glass, blur or neon exist.

**Components never reference a theme file or a palette triple — only derived
tokens, via the Tailwind aliases in `tailwind.config.js`.** Adding a theme is a
palette object in `Context`-adjacent tooling plus an entry in `lib/constants.js`.

`themes.css` is generated — see the header comment in the file.

### User knobs

`SettingsContext` is the only writer of these; it sets them on `<html>` from the
Appearance panel. Nothing else in the app writes a CSS custom property.

```
--surface-alpha    cards, panels          --glow            neon intensity 0–1
--chrome-alpha     titlebar, rail, status --shadow-strength elevation multiplier
--glass-blur       backdrop blur px       --ui-radius       base corner radius
--glass-saturate   backdrop saturation    --border-alpha    border visibility
--bg-image         wallpaper              --canvas-alpha    app bg over wallpaper
--bg-image-blur    --bg-image-dim         --bg-image-saturate
```

Two helper classes carry the treatment so it can't drift between components:
`.glass` applies the backdrop filter, `.glass-sheen` paints the diagonal
highlight that stops a translucent card from reading as a rendering bug. Both
collapse to nothing at opacity 1 / blur 0.

### Token groups

**Surfaces** — layering, darkest to lightest (in a dark theme):
```
--bg-base       page background
--bg-elevated   panels, cards
--bg-overlay    dialogs, dropdowns, the command palette
--bg-inset      inputs, code blocks, wells
```

**Chrome** — the app shell has its own surface tokens, distinct from content panels:
```
--titlebar-bg   --rail-bg   --panel-bg   --statusbar-bg
```

**Text:**
```
--fg-default    body text
--fg-muted      secondary text, labels
--fg-subtle     placeholders, disabled text
--fg-on-accent  text drawn on an accent-coloured background
```

**Borders:**
```
--border-subtle   dividers
--border-default  panel/input outlines
--border-focus    focus rings — always meets 3:1 contrast against adjacent surfaces
```

**Semantic** (each has `-bg` / `-fg` / `-border` variants — six total tokens per name):
```
--accent   --success   --warning   --danger   --info
```

**Difficulty** (problems/contests):
```
--easy   --medium   --hard
```

**Scale:**
```
--space-{1,2,3,4,6,8,12,16,24}    4px base unit
--radius-{sm,md,lg,full}
--shadow-{sm,md,lg,overlay}
--font-sans   --font-mono
--text-{xs,sm,base,lg,xl,2xl,3xl}
```

## Shipped themes

Eighteen, all defined in `src/styles/themes.css` and listed in
`lib/constants.js` `THEMES`.

**Dark** — `dark-plus` (default), `abyss`, `anysphere`, `tokyo-night`,
`catppuccin-mocha`, `night-owl`, `monokai`, `synthwave`, `kanagawa`, `nord`,
`dracula`, `one-dark`, `gruvbox-dark`, `github-dark`

**Light** — `light-plus`, `github-light`, `solarized-light`, `quiet-light`

Applied by setting `data-theme` on `<html>`, persisted in `localStorage`.
`vscode-dark` / `vscode-light` were renamed to `dark-plus` / `light-plus`;
`LEGACY_THEME_ALIASES` migrates stored preferences so nobody's theme silently
resets.

The **editor theme is a separate setting** from the app theme (Settings §Editor).
CodeMirror ships ports for only eight of the eighteen, so `themeMap.js` maps each
unported theme to its nearest available neighbour rather than falling back to
Dark+ — a Solarized Light shell should not frame a Dark+ editor.

## Appearance presets

`APPEARANCE_PRESETS` in `lib/constants.js` — one-click patches over the surface
knobs, deliberately leaving `theme` alone:

| Preset | Reads as |
| --- | --- |
| Native IDE | Opaque, flat, no blur. Stock VS Code. |
| Glass | Translucent surfaces, heavy backdrop blur. |
| Neon | Max glow, deep shadows, soft glass. |
| Minimal | Sharp corners, no glow, faint borders. |

Wallpapers (`BACKGROUND_PRESETS`) are CSS gradients composed from the active
palette, not image files — they cost nothing to ship, theme themselves, and
never 404. A custom URL is also accepted; the scheme is allowlisted to
`http(s):` and `data:image/` before it reaches a style property.

## Component inventory

`src/components/ui/` — every primitive is token-driven, keyboard-navigable, and has a
visible focus ring on `:focus-visible`.

| Component | Notes |
| --- | --- |
| `Button` | variants: `primary` `secondary` `ghost` `subtle` `outline` `danger` `success`; sizes `xs` `sm` `md` `lg` `icon`; `loading`, `iconLeft`/`iconRight`. Glow is attached per-variant so the neon slider lights the primary actions and leaves quiet ones alone |
| `Card` | glass surface + border + radius; `interactive` adds hover lift, `glow` adds a halo. No dynamic class props (the old `Card` built classes like `` p-${props.p} `` which Tailwind can never see — never do this) |
| `StatCard` | one headline number with an accent rule; used across profile/home dashboards |
| `Switch` / `Slider` / `SegmentedControl` | the Settings controls — label + live readout live here rather than being re-implemented per row |
| `Dialog` | focus trap, `Esc` to close, scroll lock, backdrop click, portal |
| `Input` / `Textarea` | label, hint, error state, prefix/suffix slots |
| `Select` | native-backed, styled |
| `Tabs` | roving tabindex, arrow-key navigation |
| `Badge` | status/difficulty pills — colour comes from a token lookup by key, never from an interpolated class |
| `Toast` + `ToastProvider` | queued, auto-dismiss, `success`/`error`/`info` variants |
| `Table` | sortable headers, sticky header option |
| `Tooltip` | delayed, keyboard-triggerable |
| `DropdownMenu` | keyboard nav, closes on outside click / `Esc` |
| `Avatar` | image with initials fallback |
| `Skeleton` | shimmer sweep (not a pulse — a pulsing block is invisible on a translucent surface), composed into per-screen loading skeletons |
| `Spinner` | inline loading indicator |
| `EmptyState` | icon + title + description + optional action |
| `ErrorState` | icon + message + **Retry** button wired to `refetch` |

### The class-interpolation rule

Tailwind's JIT scanner statically greps source files for complete class name strings.
It **cannot** see a class assembled at runtime:

```jsx
// ❌ never — "p-4" doesn't exist in the compiled output, so this is a no-op
<div className={`p-${props.p}`} />

// ✅ always — pick from a fixed map, or use inline style bound to a token
const PAD = { sm: 'p-2', md: 'p-4', lg: 'p-6' };
<div className={PAD[size]} />
```

Every dynamic-looking class in this codebase (spacing props, tag colours, status
colours) must resolve through a lookup table like `PAD` above, never string
interpolation. This was the single largest cause of "why doesn't this style apply" in
the previous version.

## Layout chrome

```
┌────────────────────────────────────────────────────────┐
│  TitleBar (44px)                                        │
├──────┬───────────────────────────────────────────────────┤
│      │                                                   │
│ Rail │              <Outlet /> content area              │
│(52px)│         (feature screens render here)             │
│      │                                                   │
├──────┴───────────────────────────────────────────────────┤
│  StatusBar (26px)                                        │
└────────────────────────────────────────────────────────┘
```

Behind all of it sit two fixed layers rendered by `Backdrop`: `.app-backdrop`
(the wallpaper, blurred and dimmed) and `.app-aurora` (an ambient accent bloom
that scales with `--glow`). Both are driven purely by custom properties, so
changing a slider repaints without React touching the tree.

- **TitleBar** — logo, centred `Ctrl+K` quick-open, avatar menu.
- **ActivityRail** — icon-only, tooltip on hover, active-route indicator.
- **StatusBar** — connection state, current language, run status, points.
- **SplitPane** — draggable divider, ratio persisted per-screen to `localStorage`. Used by every IDE-style screen (problem solve, query detail/post, playground).
- **CommandPalette** — `Ctrl+K`; grouped (Go to / Actions / Appearance / Themes) because eighteen theme entries would otherwise bury the nine navigation ones.
- **PublicShell** — separate, simpler chrome for the two pages an anonymous visitor can reach. Not the IDE frame: there is no workspace to frame yet.

## Charts

`components/charts/`. All four read their colours from the live theme through
`chartTheme.js` — never from constants. The previous charts hardcoded
`rgba(63, 185, 80, …)` and `#9d9d9d`, a GitHub-dark palette pinned into a product
that ships eighteen themes: the legend text was invisible on Solarized Light and
the difficulty colours disagreed with the badges sitting beside them.

`useChartTheme()` re-reads the custom properties on the frame *after* a theme
change — SettingsContext writes them in an effect, so a synchronous read during
render returns the previous theme.

| Chart | Form | Why that form |
| --- | --- | --- |
| `StreakHeatmap` | calendar grid, sequential | magnitude over a date grid; one hue, 4 steps + a track. Level 0 uses the border colour so "nothing" never reads as "a little" |
| `ActivityTrendChart` | area, one series | trend over time. Weekly buckets — 365 daily marks in a 200px box is noise, and the heatmap beside it already carries per-day detail. No legend: one series, and the panel title names it |
| `DifficultyBreakdown` | three meters | a ratio against a limit. Replaced a 4-slice doughnut whose fourth slice was "Remaining" — a pie is the wrong form for close values, and three of its slices asked the same question |
| `QueryBreakdownChart` | stacked bar, 2 series | part-to-whole. Replaced three `<progress>` rows plotted against the same max, one of which was therefore always full |

Rules these follow, and any new chart must too: sequential scales are **one hue,
light→dark** (never a rainbow); categorical hues are assigned by entity in fixed
order and never cycled; there is **no dual-axis chart** anywhere; marks are thin
with recessive grid and axes; ≥2 series get a legend *and* direct labels, so
identity is never colour-alone; every chart has an `EmptyState` for no data.

## Accessibility baseline

- Every interactive element is reachable by keyboard and shows a visible focus ring.
- Dialogs trap focus and restore it to the trigger on close.
- Colour is never the only signal — status/difficulty pairs text or an icon with colour.
- Text-on-background pairs meet WCAG AA (4.5:1) in every shipped theme.
- `prefers-reduced-motion` is honoured; the Settings toggle forces it regardless of OS setting.
