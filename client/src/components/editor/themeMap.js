import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { nord } from '@uiw/codemirror-theme-nord';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';

/** Maps a Settings `editor.theme` id to a CodeMirror 6 theme extension. */
export const EDITOR_THEME_MAP = {
  'dark-plus': vscodeDark,
  'light-plus': vscodeLight,
  dracula,
  'github-dark': githubDark,
  'github-light': githubLight,
  nord,
  'tokyo-night': tokyoNight,
  'gruvbox-dark': gruvboxDark,
};

/**
 * The UI ships more themes than CodeMirror has ports for. Rather than dropping
 * those users back to Dark+ — which looks wrong next to, say, a Solarized
 * Light shell — each unported theme names its closest available neighbour.
 */
const NEAREST = {
  abyss: 'tokyo-night',
  anysphere: 'dark-plus',
  'catppuccin-mocha': 'tokyo-night',
  'night-owl': 'tokyo-night',
  monokai: 'dracula',
  synthwave: 'dracula',
  kanagawa: 'gruvbox-dark',
  'one-dark': 'dracula',
  'solarized-light': 'github-light',
  'quiet-light': 'light-plus',
};

export function resolveEditorTheme(id) {
  return EDITOR_THEME_MAP[id] ?? EDITOR_THEME_MAP[NEAREST[id]] ?? vscodeDark;
}
