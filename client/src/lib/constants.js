// Socket event names — mirrored exactly by services/socket_service/actions.js.
// Keep the two files in sync; this is the single source of truth on the client.
export const ACTIONS = {
  JOIN: 'join',
  JOINED: 'joined',
  DISCONNECTED: 'disconnected',
  CODE_CHANGE: 'code-change',
  SYNC_CHANGE: 'sync-code',
  CHAT: 'chat',
  LEAVE: 'leave',
};

// Editor + compile-server language identifiers.
export const LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
];

// Query categories. Values are the literal strings stored in Mongo — including
// the historical typos ("competetive", "acedemic") — matched elsewhere by the
// stats aggregation. Never "fix" these without a data migration; see
// Context/02-data-model.md. `label` is what the UI shows.
export const QUERY_TAGS = [
  { value: 'others', label: 'Others' },
  { value: 'machine learning', label: 'Machine Learning' },
  { value: 'cyber security', label: 'Cyber Security' },
  { value: 'web dev', label: 'Web Dev' },
  { value: 'competetive', label: 'Competitive' },
  { value: 'acedemic', label: 'Academic' },
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const CONTEST_POINT_OPTIONS = [50, 100, 150, 200];

export const YEAR_OPTIONS = ['1st year', '2nd year', '3rd year', '4th year'];

// Contest state derived from start/end timestamps. The server sends a legacy
// Bootstrap-flavoured `message` field (secondary/success/danger) — map it here
// rather than using it as a className anywhere.
export const CONTEST_STATE = {
  secondary: { key: 'upcoming', label: 'Upcoming' },
  success: { key: 'live', label: 'Live' },
  danger: { key: 'ended', label: 'Ended' },
};

// UI themes. Every id here must have a matching `[data-theme='<id>']` block in
// styles/themes.css — that file is generated, see its header. `swatch` drives
// the preview tile in Settings so the picker never has to mount a real theme.
export const THEMES = [
  { id: 'dark-plus', label: 'Dark+', mode: 'dark', swatch: ['#1e1e1e', '#3ea6ff', '#252526'] },
  { id: 'abyss', label: 'Abyss', mode: 'dark', swatch: ['#000c18', '#82daff', '#051336'] },
  { id: 'anysphere', label: 'Anysphere', mode: 'dark', swatch: ['#1a1a1a', '#87c3ff', '#1f1f1f'] },
  { id: 'tokyo-night', label: 'Tokyo Night', mode: 'dark', swatch: ['#1a1b26', '#7aa2f7', '#1f2335'] },
  { id: 'catppuccin-mocha', label: 'Catppuccin Mocha', mode: 'dark', swatch: ['#1e1e2e', '#89b4fa', '#313244'] },
  { id: 'night-owl', label: 'Night Owl', mode: 'dark', swatch: ['#011627', '#82aaff', '#0b2942'] },
  { id: 'monokai', label: 'Monokai Pro', mode: 'dark', swatch: ['#2d2a2e', '#ffd866', '#403e41'] },
  { id: 'synthwave', label: "Synthwave '84", mode: 'dark', swatch: ['#262335', '#ff7edb', '#34294f'] },
  { id: 'kanagawa', label: 'Kanagawa', mode: 'dark', swatch: ['#1f1f28', '#7e9cd8', '#2a2a37'] },
  { id: 'nord', label: 'Nord', mode: 'dark', swatch: ['#2e3440', '#88c0d0', '#3b4252'] },
  { id: 'dracula', label: 'Dracula', mode: 'dark', swatch: ['#282a36', '#bd93f9', '#44475a'] },
  { id: 'one-dark', label: 'One Dark', mode: 'dark', swatch: ['#282c34', '#61afef', '#2c313a'] },
  { id: 'gruvbox-dark', label: 'Gruvbox Dark', mode: 'dark', swatch: ['#282828', '#83a598', '#3c3836'] },
  { id: 'github-dark', label: 'GitHub Dark', mode: 'dark', swatch: ['#0d1117', '#58a6ff', '#21262d'] },
  { id: 'light-plus', label: 'Light+', mode: 'light', swatch: ['#ffffff', '#005fb8', '#f3f3f3'] },
  { id: 'github-light', label: 'GitHub Light', mode: 'light', swatch: ['#ffffff', '#0969da', '#f6f8fa'] },
  { id: 'solarized-light', label: 'Solarized Light', mode: 'light', swatch: ['#fdf6e3', '#268bd2', '#eee8d5'] },
  { id: 'quiet-light', label: 'Quiet Light', mode: 'light', swatch: ['#f5f5f5', '#705697', '#ececec'] },
];

export const THEME_IDS = THEMES.map((t) => t.id);

// Renamed in the v2 settings schema; kept so stored preferences survive the
// rename instead of silently resetting to the default theme.
export const LEGACY_THEME_ALIASES = {
  'vscode-dark': 'dark-plus',
  'vscode-light': 'light-plus',
};

// CodeMirror ships far fewer themes than the UI has. Anything without a real
// port falls back to the closest available one rather than to Dark+, so the
// editor still looks like it belongs to the surrounding chrome.
export const EDITOR_THEMES = [
  { id: 'dark-plus', label: 'Dark+' },
  { id: 'light-plus', label: 'Light+' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'github-dark', label: 'GitHub Dark' },
  { id: 'github-light', label: 'GitHub Light' },
  { id: 'nord', label: 'Nord' },
  { id: 'tokyo-night', label: 'Tokyo Night' },
  { id: 'gruvbox-dark', label: 'Gruvbox Dark' },
];

export const KEYMAPS = [
  { id: 'default', label: 'Default' },
  { id: 'vim', label: 'Vim' },
  { id: 'emacs', label: 'Emacs' },
];

export const FONT_FAMILIES = [
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
  { id: 'Fira Code', label: 'Fira Code' },
  { id: 'Cascadia Code', label: 'Cascadia Code' },
  { id: 'Consolas', label: 'Consolas' },
  { id: 'ui-monospace', label: 'System monospace' },
];

// One-click looks for the Appearance panel. Each is a partial patch over the
// current appearance settings — theme choice is deliberately left alone so a
// preset never overrides the palette the user picked.
export const APPEARANCE_PRESETS = [
  {
    id: 'ide',
    label: 'Native IDE',
    description: 'Opaque, flat, zero blur. Closest to stock VS Code.',
    patch: { surfaceAlpha: 1, chromeAlpha: 1, glassBlur: 0, glow: 0, shadowStrength: 0.6, radius: 6, backgroundStrength: 0 },
  },
  {
    id: 'glass',
    label: 'Glass',
    description: 'Translucent surfaces with a heavy backdrop blur.',
    patch: { surfaceAlpha: 0.62, chromeAlpha: 0.55, glassBlur: 22, glow: 0.35, shadowStrength: 1.1, radius: 12, backgroundStrength: 0.55 },
  },
  {
    id: 'neon',
    label: 'Neon',
    description: 'Maximum glow, deep shadows, soft glass.',
    patch: { surfaceAlpha: 0.7, chromeAlpha: 0.6, glassBlur: 16, glow: 1, shadowStrength: 1.5, radius: 14, backgroundStrength: 0.45 },
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Sharp corners, no glow, barely-there borders.',
    patch: { surfaceAlpha: 1, chromeAlpha: 1, glassBlur: 0, glow: 0, shadowStrength: 0.25, radius: 2, backgroundStrength: 0 },
  },
];

// Bundled wallpapers. Pure CSS gradients rather than image files so they cost
// nothing to ship, theme themselves off the palette, and never 404.
export const BACKGROUND_PRESETS = [
  { id: 'none', label: 'None', value: 'none' },
  {
    id: 'aurora',
    label: 'Aurora',
    value:
      'radial-gradient(at 15% 20%, rgb(var(--accent-hi-rgb) / 0.55) 0px, transparent 55%), radial-gradient(at 85% 10%, rgb(var(--info-rgb) / 0.45) 0px, transparent 50%), radial-gradient(at 70% 85%, rgb(var(--accent-rgb) / 0.5) 0px, transparent 55%), radial-gradient(at 25% 90%, rgb(var(--danger-rgb) / 0.3) 0px, transparent 50%)',
  },
  {
    id: 'mesh',
    label: 'Mesh',
    value:
      'radial-gradient(at 0% 0%, rgb(var(--accent-hi-rgb) / 0.5) 0px, transparent 45%), radial-gradient(at 100% 0%, rgb(var(--danger-rgb) / 0.35) 0px, transparent 45%), radial-gradient(at 100% 100%, rgb(var(--success-rgb) / 0.4) 0px, transparent 45%), radial-gradient(at 0% 100%, rgb(var(--info-rgb) / 0.45) 0px, transparent 45%)',
  },
  {
    id: 'grid',
    label: 'Grid',
    value:
      'linear-gradient(rgb(var(--accent-hi-rgb) / 0.14) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--accent-hi-rgb) / 0.14) 1px, transparent 1px)',
    size: '48px 48px',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    value:
      'linear-gradient(160deg, rgb(var(--accent-rgb) / 0.7) 0%, rgb(var(--danger-rgb) / 0.5) 45%, rgb(var(--warning-rgb) / 0.45) 100%)',
  },
  {
    id: 'deep',
    label: 'Deep Space',
    value:
      'radial-gradient(ellipse at 50% -20%, rgb(var(--accent-hi-rgb) / 0.4) 0px, transparent 60%), radial-gradient(ellipse at 20% 120%, rgb(var(--info-rgb) / 0.3) 0px, transparent 55%)',
  },
];
