import { cn } from '../../lib/cn';
import { EmptyState } from '../ui';

/**
 * Queries asked vs solved, as one part-to-whole bar.
 *
 * Replaces three stacked `<progress>` rows that plotted total, asked and
 * solved against the same maximum — the "total" row was always full, so a
 * third of the chart carried no information. (The original also paired each
 * number with the wrong label; see Context/07-known-issues.md.)
 *
 * Two series, so there is a legend, and both segments are direct-labelled —
 * identity is never colour-alone. The gap between segments is a surface
 * spacer, not padding.
 */
export function QueryBreakdownChart({ total = 0, asked = 0, solved = 0, className }) {
  if (total === 0) {
    return (
      <EmptyState
        title="No queries yet"
        description="Ask one when you're stuck, or solve someone else's for double the points."
        className={className}
      />
    );
  }

  // A user can both ask and solve the same query, so asked + solved can exceed
  // the stored total. Widen the denominator rather than let the bar overflow.
  const denominator = Math.max(total, asked + solved, 1);
  const askedPct = (asked / denominator) * 100;
  const solvedPct = (solved / denominator) * 100;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums text-fg">{total}</span>
        <span className="text-sm text-fg-muted">queries touched</span>
      </div>

      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-inset">
        <div
          className="h-full rounded-l-full bg-accent transition-all duration-slow ease-out"
          style={{ width: `${askedPct}%` }}
        />
        <div className="h-full bg-success transition-all duration-slow ease-out" style={{ width: `${solvedPct}%` }} />
      </div>

      <ul className="flex flex-col gap-2">
        <LegendRow color="bg-accent" label="Asked" value={asked} hint="questions posted" />
        <LegendRow color="bg-success" label="Solved" value={solved} hint="answers given" />
      </ul>
    </div>
  );
}

function LegendRow({ color, label, value, hint }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', color)} aria-hidden="true" />
      <span className="font-medium text-fg">{label}</span>
      <span className="text-fg-subtle">{hint}</span>
      <span className="ml-auto font-mono tabular-nums text-fg-muted">{value}</span>
    </li>
  );
}
