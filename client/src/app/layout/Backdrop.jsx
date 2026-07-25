/**
 * The two fixed layers that sit behind every screen.
 *
 * Both are driven entirely by CSS custom properties written by
 * SettingsContext, so they re-render never — changing the wallpaper or the
 * glow slider repaints without React touching the tree.
 */
export function Backdrop() {
  return (
    <>
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-aurora" aria-hidden="true" />
    </>
  );
}
