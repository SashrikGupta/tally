import { useEffect, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

/*
 * Charts have to read their colours from the live theme, not from constants.
 *
 * The previous charts hardcoded `rgba(63, 185, 80, …)` and `#9d9d9d`, which is
 * a GitHub-dark palette pinned into a product that ships eighteen themes — the
 * legend text was invisible on Solarized Light and the difficulty colours
 * disagreed with the badges sitting right next to them.
 *
 * Everything below resolves from the same custom properties the rest of the UI
 * uses, so a chart and the badge beside it can never drift.
 */

/** Palette slots a chart may use. Values are `R G B` triples from the theme. */
const SLOTS = {
  fg: '--fg-rgb',
  fgMuted: '--fg-muted-rgb',
  fgSubtle: '--fg-subtle-rgb',
  border: '--border-rgb',
  borderSubtle: '--border-subtle-rgb',
  surface: '--elevated-rgb',
  inset: '--inset-rgb',
  accent: '--accent-hi-rgb',
  info: '--info-rgb',
  success: '--success-rgb',
  warning: '--warning-rgb',
  danger: '--danger-rgb',
  easy: '--easy-rgb',
  medium: '--medium-rgb',
  hard: '--hard-rgb',
};

const FALLBACK = '212 212 212';

function readTriples() {
  const styles = getComputedStyle(document.documentElement);
  const out = {};
  for (const [name, prop] of Object.entries(SLOTS)) {
    out[name] = (styles.getPropertyValue(prop) || '').trim() || FALLBACK;
  }
  return out;
}

function buildPalette(triples) {
  /** `color('accent', 0.4)` → an rgb() string with alpha. */
  const color = (slot, alpha = 1) => {
    const triple = triples[slot] ?? FALLBACK;
    return alpha >= 1 ? `rgb(${triple})` : `rgb(${triple} / ${alpha})`;
  };

  return {
    triples,
    color,
    /**
     * Categorical slots in fixed order. Assigned by entity, never by rank, and
     * never cycled — past four series a chart folds the tail into "Other"
     * rather than inventing a hue nothing can tell apart.
     */
    series: ['accent', 'warning', 'info', 'danger'].map((slot) => color(slot)),
    text: color('fgMuted'),
    textSubtle: color('fgSubtle'),
    grid: color('borderSubtle', 0.7),
    axis: color('border'),
    tooltipBg: color('inset'),
    tooltipBorder: color('border'),
  };
}

/**
 * Live palette for the active theme.
 *
 * Re-read on the next frame after a theme change rather than during render:
 * SettingsContext writes the custom properties in an effect, so reading
 * synchronously would return the *previous* theme's values.
 */
export function useChartTheme() {
  const { settings } = useSettings();
  const { theme } = settings.appearance;
  const [palette, setPalette] = useState(() => buildPalette(readTriples()));

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPalette(buildPalette(readTriples())));
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  return palette;
}

/** Shared Chart.js options: recessive chrome, themed tooltip, no clutter. */
export function baseChartOptions(palette) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: palette.tooltipBg,
        borderColor: palette.tooltipBorder,
        borderWidth: 1,
        titleColor: palette.color('fg'),
        bodyColor: palette.text,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
      },
    },
  };
}
