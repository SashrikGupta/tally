import { cn } from '../../lib/cn';
import { EmptyState } from '../ui';

const ROWS = [
  { id: 'Easy', label: 'Easy', bar: 'bg-easy', text: 'text-easy' },
  { id: 'Medium', label: 'Medium', bar: 'bg-medium', text: 'text-medium' },
  { id: 'Hard', label: 'Hard', bar: 'bg-hard', text: 'text-hard' },
];

/**
 * Solved-vs-available problems, one meter per difficulty.
 *
 * This replaces a four-slice doughnut whose fourth slice was "Remaining" — a
 * pie is the wrong form for comparing close values, and three of its four
 * slices were the same question asked three times. Three meters answer it
 * directly, are readable at a glance, and are each direct-labelled, so no
 * legend and no colour-only encoding.
 *
 * Colours are the app's own `--easy/--medium/--hard` tokens, so a row here and
 * the difficulty badge on the problem list can never disagree.
 *
 * stats: { total, totals: {Easy,Medium,Hard}, solved: {…}, solvedTotal }
 */
export function DifficultyBreakdown({ stats, className }) {
  const total = stats?.total ?? 0;
  const solvedTotal = stats?.solvedTotal ?? 0;

  if (!stats || total === 0) {
    return (
      <EmptyState
        title="Nothing to chart yet"
        description="Once problems exist, your progress across each difficulty shows up here."
        className={className}
      />
    );
  }

  const pct = total > 0 ? Math.round((solvedTotal / total) * 100) : 0;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold tabular-nums text-fg">{solvedTotal}</span>
        <span className="text-sm text-fg-muted">
          of {total} solved · <span className="text-accent-border">{pct}%</span>
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {ROWS.map((row) => {
          const solved = stats.solved?.[row.id] ?? 0;
          // Per-difficulty totals were added to the endpoint for this; without
          // them a row would have to measure itself against the grand total,
          // which makes every bar look far emptier than it is.
          const available = stats.totals?.[row.id] ?? 0;
          const ratio = available > 0 ? Math.min(1, solved / available) : 0;

          return (
            <div key={row.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className={cn('font-medium', row.text)}>{row.label}</span>
                <span className="font-mono tabular-nums text-fg-muted">
                  {solved}
                  <span className="text-fg-subtle"> / {available}</span>
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-inset"
                role="meter"
                aria-valuenow={solved}
                aria-valuemin={0}
                aria-valuemax={available}
                aria-label={`${row.label} problems solved`}
              >
                <div
                  className={cn('h-full rounded-full transition-all duration-slow ease-out', row.bar)}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
