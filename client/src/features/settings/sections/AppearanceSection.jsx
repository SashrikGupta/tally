import { useRef } from 'react';
import { IoCheckmark, IoRefreshOutline } from 'react-icons/io5';
import { useSettings } from '../../../contexts/SettingsContext';
import { useToast } from '../../../contexts/ToastContext';
import { APPEARANCE_PRESETS, BACKGROUND_PRESETS, THEMES } from '../../../lib/constants';
import { Section } from '../../../components/layout/Section';
import { Button, Input, SegmentedControl, Slider, Switch, Card } from '../../../components/ui';
import { cn } from '../../../lib/cn';

const DARK_THEMES = THEMES.filter((t) => t.mode === 'dark');
const LIGHT_THEMES = THEMES.filter((t) => t.mode === 'light');

export function AppearanceSection() {
  const { settings, setAppearance, resetAppearance, exportSettings, importSettings } = useSettings();
  const { appearance } = settings;
  const toast = useToast();
  const fileRef = useRef(null);

  const onImport = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      if (importSettings(text)) toast.success('Settings imported.');
      else toast.error('That file is not a valid settings export.');
    });
  };

  const onExport = () => {
    const blob = new Blob([exportSettings()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codeconnect-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const wallpaperOff = appearance.background === 'none' || (appearance.background === 'custom' && !appearance.backgroundUrl);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Section
        title="Presets"
        description="A starting point for the sliders below. Your theme is left untouched."
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {APPEARANCE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setAppearance(preset.patch)}
              title={preset.description}
              className="flex flex-col gap-1 rounded-lg border border-border bg-elevated p-3 text-left transition-all duration-fast hover:-translate-y-0.5 hover:border-accent-border hover:shadow-[var(--shadow-md),var(--glow-accent-sm)]"
            >
              <span className="text-sm font-medium text-fg">{preset.label}</span>
              <span className="text-[11px] leading-snug text-fg-muted">{preset.description}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Theme" description="Applies instantly across the whole interface.">
        <div className="flex flex-col gap-4">
          <ThemeGrid label="Dark" themes={DARK_THEMES} active={appearance.theme} onPick={(theme) => setAppearance({ theme })} />
          <ThemeGrid label="Light" themes={LIGHT_THEMES} active={appearance.theme} onPick={(theme) => setAppearance({ theme })} />
        </div>
      </Section>

      <Section title="Surfaces" description="How solid the panels and cards are, and how much they blur what's behind them.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Slider
            label="Card opacity"
            value={appearance.surfaceAlpha}
            onChange={(surfaceAlpha) => setAppearance({ surfaceAlpha })}
            min={0.25}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Chrome opacity"
            description="Title bar, activity rail, status bar."
            value={appearance.chromeAlpha}
            onChange={(chromeAlpha) => setAppearance({ chromeAlpha })}
            min={0.25}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Glass blur"
            value={appearance.glassBlur}
            onChange={(glassBlur) => setAppearance({ glassBlur })}
            min={0}
            max={40}
            step={1}
            unit="px"
          />
          <Slider
            label="Glass saturation"
            value={appearance.glassSaturate}
            onChange={(glassSaturate) => setAppearance({ glassSaturate })}
            min={100}
            max={200}
            step={5}
            unit="%"
          />
          <Slider
            label="Border strength"
            value={appearance.borderAlpha}
            onChange={(borderAlpha) => setAppearance({ borderAlpha })}
            min={0}
            max={1}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Corner radius"
            value={appearance.radius}
            onChange={(radius) => setAppearance({ radius })}
            min={0}
            max={20}
            step={1}
            unit="px"
          />
        </div>
      </Section>

      <Section title="Light & depth" description="Neon accents and how far surfaces float off the background.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Slider
            label="Neon glow"
            description="Halos on buttons, badges and the active rail item."
            value={appearance.glow}
            onChange={(glow) => setAppearance({ glow })}
            min={0}
            max={1}
            step={0.05}
            format={(v) => (v === 0 ? 'Off' : `${Math.round(v * 100)}%`)}
          />
          <Slider
            label="Shadow depth"
            value={appearance.shadowStrength}
            onChange={(shadowStrength) => setAppearance({ shadowStrength })}
            min={0}
            max={2}
            step={0.05}
            format={(v) => `${v.toFixed(2)}×`}
          />
        </div>
      </Section>

      <Section title="Background" description="A wallpaper behind the workspace. Presets are gradients themed off your palette.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {BACKGROUND_PRESETS.map((bg) => (
              <BackgroundSwatch
                key={bg.id}
                bg={bg}
                active={appearance.background === bg.id}
                onPick={() => setAppearance({ background: bg.id })}
              />
            ))}
            <BackgroundSwatch
              bg={{ id: 'custom', label: 'Custom' }}
              active={appearance.background === 'custom'}
              onPick={() => setAppearance({ background: 'custom' })}
            />
          </div>

          {appearance.background === 'custom' && (
            <Input
              label="Image URL"
              placeholder="https://… or data:image/…"
              hint="Only http(s) and data:image URLs are accepted."
              value={appearance.backgroundUrl}
              onChange={(e) => setAppearance({ backgroundUrl: e.target.value })}
            />
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Slider
              label="Strength"
              description="How much shows through."
              value={appearance.backgroundStrength}
              onChange={(backgroundStrength) => setAppearance({ backgroundStrength })}
              min={0}
              max={0.9}
              step={0.01}
              disabled={wallpaperOff}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="Blur"
              value={appearance.backgroundBlur}
              onChange={(backgroundBlur) => setAppearance({ backgroundBlur })}
              min={0}
              max={160}
              step={2}
              unit="px"
              disabled={wallpaperOff}
            />
            <Slider
              label="Saturation"
              value={appearance.backgroundSaturate}
              onChange={(backgroundSaturate) => setAppearance({ backgroundSaturate })}
              min={0}
              max={220}
              step={5}
              unit="%"
              disabled={wallpaperOff}
            />
          </div>
        </div>
      </Section>

      <Section title="Layout & motion">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-fg">Density</span>
            <SegmentedControl
              value={appearance.density}
              onChange={(density) => setAppearance({ density })}
              options={[
                { id: 'comfortable', label: 'Comfortable' },
                { id: 'compact', label: 'Compact' },
              ]}
            />
          </div>

          <Slider
            label="Interface scale"
            value={appearance.fontScale}
            onChange={(fontScale) => setAppearance({ fontScale })}
            min={0.875}
            max={1.25}
            step={0.025}
            format={(v) => `${Math.round(v * 100)}%`}
          />

          <Switch
            label="Reduce motion"
            description="Disables entrance animations and transitions everywhere."
            checked={appearance.reduceMotion}
            onChange={(reduceMotion) => setAppearance({ reduceMotion })}
          />
        </div>
      </Section>

      <Section title="Preview" description="A live sample of the current settings.">
        <Preview />
      </Section>

      <Section title="Backup" description="Move a look to another browser, or start over.">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onExport}>
            Export JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <input ref={fileRef} type="file" accept="application/json" onChange={onImport} className="hidden" />
          <Button variant="ghost" size="sm" iconLeft={<IoRefreshOutline />} onClick={resetAppearance}>
            Reset appearance
          </Button>
        </div>
      </Section>
    </div>
  );
}

function ThemeGrid({ label, themes, active, onPick }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</span>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {themes.map((t) => {
          const isActive = active === t.id;
          const [bg, accent, panel] = t.swatch;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              aria-pressed={isActive}
              className={cn(
                'group flex flex-col gap-2 rounded-lg border p-2 text-left transition-all duration-fast',
                isActive
                  ? 'border-accent-border shadow-[var(--glow-accent-sm)]'
                  : 'border-border hover:-translate-y-0.5 hover:border-border-focus',
              )}
            >
              {/* A miniature of the app chrome, drawn from the theme's own
                  colours so the preview is honest without mounting the theme. */}
              <span
                className="relative flex h-12 overflow-hidden rounded-md border border-black/20"
                style={{ backgroundColor: bg }}
              >
                <span className="h-full w-2.5" style={{ backgroundColor: panel }} />
                <span className="flex flex-1 flex-col justify-center gap-1 p-1.5">
                  <span className="h-1 w-3/4 rounded-full" style={{ backgroundColor: accent }} />
                  <span className="h-1 w-1/2 rounded-full opacity-40" style={{ backgroundColor: accent }} />
                  <span className="h-1 w-2/3 rounded-full opacity-25" style={{ backgroundColor: accent }} />
                </span>
                {isActive && (
                  <span
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                    style={{ backgroundColor: accent, color: bg }}
                  >
                    <IoCheckmark />
                  </span>
                )}
              </span>
              <span className={cn('truncate text-xs font-medium', isActive ? 'text-accent-border' : 'text-fg')}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BackgroundSwatch({ bg, active, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border p-1.5 transition-all duration-fast',
        active ? 'border-accent-border shadow-[var(--glow-accent-sm)]' : 'border-border hover:border-border-focus',
      )}
    >
      <span
        className="h-10 w-full rounded-md border border-border-subtle bg-inset-solid"
        style={
          bg.value && bg.value !== 'none'
            ? { backgroundImage: bg.value, backgroundSize: bg.size ?? 'cover' }
            : undefined
        }
      />
      <span className={cn('text-[11px]', active ? 'text-accent-border' : 'text-fg-muted')}>{bg.label}</span>
    </button>
  );
}

/** Renders the primitives most affected by the sliders, at real size. */
function Preview() {
  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      <Button size="sm">Primary</Button>
      <Button size="sm" variant="secondary">
        Secondary
      </Button>
      <Button size="sm" variant="danger">
        Danger
      </Button>
      <span className="rounded-full border border-accent-border/40 bg-accent-soft px-2 py-0.5 text-xs text-accent-border shadow-[0_0_calc(12px*var(--glow))_currentColor]">
        Badge
      </span>
      <code className="rounded-md border border-border bg-inset px-2 py-1 font-mono text-xs text-fg-muted">
        const x = 42;
      </code>
    </Card>
  );
}
