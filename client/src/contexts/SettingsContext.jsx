import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BACKGROUND_PRESETS, LEGACY_THEME_ALIASES, THEME_IDS } from '../lib/constants';

const STORAGE_KEY = 'codeconnect:settings:v1';

const SCHEMA_VERSION = 2;

const DEFAULT_SETTINGS = {
  version: SCHEMA_VERSION,
  appearance: {
    theme: 'dark-plus',
    density: 'comfortable', // 'comfortable' | 'compact'
    fontScale: 1, // 0.875 – 1.25
    reduceMotion: false,

    // Surface treatment. These map 1:1 onto the user knobs in tokens.css.
    surfaceAlpha: 0.86, // cards + panels
    chromeAlpha: 0.8, // title bar, rail, status bar
    glassBlur: 14, // px of backdrop blur on translucent surfaces
    glassSaturate: 140, // % saturation lift behind glass
    glow: 0.35, // neon intensity, 0–1
    shadowStrength: 1, // elevation multiplier, 0–2
    radius: 10, // base corner radius in px
    borderAlpha: 1,

    // Wallpaper
    background: 'aurora', // a BACKGROUND_PRESETS id, or 'custom'
    backgroundUrl: '', // used when background === 'custom'
    backgroundStrength: 0.45, // how much of the wallpaper shows through
    backgroundBlur: 60, // px
    backgroundSaturate: 120, // %
  },
  editor: {
    theme: 'dark-plus',
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    tabSize: 4,
    lineNumbers: true,
    lineWrapping: false,
    bracketMatching: true,
    autoCloseBrackets: true,
    highlightActiveLine: true,
    ligatures: false,
  },
  keymap: 'default', // 'default' | 'vim' | 'emacs'
  playground: {
    defaultLanguage: 'python',
    autoRunOnSave: false,
    outputPosition: 'bottom', // 'bottom' | 'right'
  },
};

/** Theme ids were renamed in v2; anything unrecognised falls back to default. */
function normalizeTheme(id, fallback) {
  const renamed = LEGACY_THEME_ALIASES[id] ?? id;
  return THEME_IDS.includes(renamed) ? renamed : fallback;
}

function migrate(stored) {
  if (!stored || typeof stored !== 'object') return DEFAULT_SETTINGS;

  // v1 had no surface/wallpaper keys at all. Merging against the defaults
  // fills them in, so a v1 user keeps their theme and editor prefs and simply
  // gains the new appearance controls.
  const merged = {
    ...DEFAULT_SETTINGS,
    ...stored,
    version: SCHEMA_VERSION,
    appearance: { ...DEFAULT_SETTINGS.appearance, ...stored.appearance },
    editor: { ...DEFAULT_SETTINGS.editor, ...stored.editor },
    playground: { ...DEFAULT_SETTINGS.playground, ...stored.playground },
  };

  merged.appearance.theme = normalizeTheme(merged.appearance.theme, DEFAULT_SETTINGS.appearance.theme);
  merged.editor.theme = normalizeTheme(merged.editor.theme, DEFAULT_SETTINGS.editor.theme);
  return merged;
}

/**
 * Resolves the wallpaper choice into a CSS `background-image` value.
 *
 * Custom URLs are user input landing in a style property, so the scheme is
 * allowlisted and the two characters that could terminate the `url("…")`
 * token are escaped. Anything else is dropped rather than guessed at.
 */
function resolveBackground({ background, backgroundUrl }) {
  if (background === 'custom') {
    const url = backgroundUrl?.trim();
    if (!url) return { image: 'none', size: 'cover' };
    if (!/^(https?:|data:image\/)/i.test(url)) return { image: 'none', size: 'cover' };
    const safe = url.replace(/[\\"]/g, (c) => `\\${c}`);
    return { image: `url("${safe}")`, size: 'cover' };
  }
  const preset = BACKGROUND_PRESETS.find((b) => b.id === background);
  if (!preset || preset.value === 'none') return { image: 'none', size: 'cover' };
  return { image: preset.value, size: preset.size ?? 'cover' };
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [raw, setRaw] = useLocalStorage(STORAGE_KEY, DEFAULT_SETTINGS);
  const settings = useMemo(() => migrate(raw), [raw]);
  const { appearance } = settings;

  // Every appearance value is pushed onto <html> as a custom property. This is
  // the only place that writes them — components read them through the
  // Tailwind aliases and never inspect settings for styling.
  useEffect(() => {
    const root = document.documentElement;
    const bg = resolveBackground(appearance);
    const hasWallpaper = bg.image !== 'none';

    root.setAttribute('data-theme', appearance.theme);
    root.setAttribute('data-density', appearance.density);
    root.style.fontSize = `${appearance.fontScale * 100}%`;
    root.classList.toggle('reduce-motion', appearance.reduceMotion);

    const vars = {
      '--ui-radius': `${appearance.radius}px`,
      '--surface-alpha': appearance.surfaceAlpha,
      '--chrome-alpha': appearance.chromeAlpha,
      '--glass-blur': `${appearance.glassBlur}px`,
      '--glass-saturate': `${appearance.glassSaturate}%`,
      '--glow': appearance.glow,
      '--shadow-strength': appearance.shadowStrength,
      '--border-alpha': appearance.borderAlpha,
      '--bg-image': bg.image,
      '--bg-image-size': bg.size,
      '--bg-image-blur': `${appearance.backgroundBlur}px`,
      '--bg-image-saturate': `${appearance.backgroundSaturate}%`,
      // The wallpaper is only visible through the app canvas, so "strength"
      // has to drive both the canvas opacity and the dimming veil over the
      // image. Without a wallpaper the canvas stays fully opaque.
      '--bg-image-dim': hasWallpaper ? 1 - appearance.backgroundStrength : 1,
      '--canvas-alpha': hasWallpaper ? 1 - appearance.backgroundStrength * 0.85 : 1,
    };

    for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, String(value));
  }, [appearance]);

  const update = useCallback(
    (section, patch) => {
      setRaw((prev) => {
        const base = migrate(prev);
        if (section === null) return { ...base, ...patch };
        return { ...base, [section]: { ...base[section], ...patch } };
      });
    },
    [setRaw],
  );

  const reset = useCallback(() => setRaw(DEFAULT_SETTINGS), [setRaw]);

  const resetAppearance = useCallback(
    () => update('appearance', DEFAULT_SETTINGS.appearance),
    [update],
  );

  const exportSettings = useCallback(() => JSON.stringify(settings, null, 2), [settings]);

  const importSettings = useCallback(
    (json) => {
      try {
        const parsed = JSON.parse(json);
        if (!parsed || typeof parsed !== 'object') return false;
        setRaw(migrate(parsed));
        return true;
      } catch {
        return false;
      }
    },
    [setRaw],
  );

  const value = useMemo(
    () => ({
      settings,
      setAppearance: (patch) => update('appearance', patch),
      setEditor: (patch) => update('editor', patch),
      setKeymap: (keymap) => update(null, { keymap }),
      setPlayground: (patch) => update('playground', patch),
      reset,
      resetAppearance,
      exportSettings,
      importSettings,
    }),
    [settings, update, reset, resetAppearance, exportSettings, importSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
