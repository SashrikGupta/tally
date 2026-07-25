import { useMemo, useState } from 'react';
import { addDays, format, startOfWeek, subDays } from 'date-fns';
import { IoFlameOutline } from 'react-icons/io5';
import { cn } from '../../lib/cn';
import { useChartTheme } from './chartTheme';

const WEEKDAY_LABELS = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

/**
 * Five discrete steps of ONE hue, low → high.
 *
 * A sequential scale is the right job here (magnitude, not identity), and the
 * step count is deliberately small: past ~5 bins adjacent classes blur and the
 * grid stops being readable at a glance. Level 0 is a track, not a data step —
 * it uses the border colour so "nothing happened" never reads as "a little".
 */
const LEVELS = 4;

function levelFor(value, max) {
  if (value <= 0) return 0;
  if (max <= 1) return LEVELS;
  return Math.max(1, Math.min(LEVELS, Math.ceil((value / max) * LEVELS)));
}

/**
 * A year of daily activity as a calendar grid, plus the streak numbers derived
 * from it.
 *
 * `stats` comes from the server (`GET /user/:id/activity`) so the streak shown
 * here is the same one every other surface shows. When it's absent — an older
 * cached response, or a parent that only has the raw array — the totals fall
 * back to what can be counted locally rather than rendering blank.
 */
export function StreakHeatmap({ activity = [], stats, className }) {
  const palette = useChartTheme();
  const [hovered, setHovered] = useState(null);

  const { weeks, months, maxValue, localTotals } = useMemo(() => {
    const byDate = new Map();
    for (const item of activity) {
      if (item?.date) byDate.set(item.date, (byDate.get(item.date) ?? 0) + (Number(item.value) || 0));
    }

    const today = new Date();
    const start = startOfWeek(subDays(today, 364));
    const days = [];
    for (let i = 0; i < 371; i += 1) {
      const date = addDays(start, i);
      const key = format(date, 'yyyy-MM-dd');
      days.push({ date, key, value: byDate.get(key) ?? 0, future: date > today });
    }

    const grouped = [];
    for (let i = 0; i < days.length; i += 7) grouped.push(days.slice(i, i + 7));

    // One label per month, placed on the week where that month first appears.
    const monthLabels = [];
    let lastMonth = null;
    grouped.forEach((week, index) => {
      const month = format(week[0].date, 'MMM');
      if (month !== lastMonth) {
        monthLabels.push({ index, label: month });
        lastMonth = month;
      }
    });

    const active = days.filter((d) => d.value > 0);
    return {
      weeks: grouped,
      months: monthLabels,
      maxValue: Math.max(1, ...days.map((d) => d.value)),
      localTotals: {
        totalActiveDays: active.length,
        totalActivity: active.reduce((sum, d) => sum + d.value, 0),
      },
    };
  }, [activity]);

  const currentStreak = stats?.currentStreak ?? 0;
  const longestStreak = stats?.longestStreak ?? 0;
  const totalActiveDays = stats?.totalActiveDays ?? localTotals.totalActiveDays;
  const totalActivity = stats?.totalActivity ?? localTotals.totalActivity;

  const stepColor = (level) =>
    level === 0 ? palette.color('borderSubtle', 0.55) : palette.color('success', 0.2 + 0.8 * (level / LEVELS));

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <StreakFigure value={currentStreak} label="Current streak" emphasis />
        <StreakFigure value={longestStreak} label="Longest streak" />
        <StreakFigure value={totalActiveDays} label="Active days" unit="" />
        <StreakFigure value={totalActivity} label="Total activity" unit="" />
      </div>

      <div className="themed-scrollbar overflow-x-auto pb-1">
        <div className="inline-flex min-w-full flex-col gap-1">
          {/* Month labels sit on their own row aligned to the week columns. */}
          <div className="flex gap-[3px] pl-8">
            {weeks.map((_, index) => {
              const month = months.find((m) => m.index === index);
              return (
                <span key={index} className="w-[11px] shrink-0 text-[9px] leading-3 text-fg-subtle">
                  {month ? month.label : ''}
                </span>
              );
            })}
          </div>

          <div className="flex gap-[3px]">
            <div className="flex w-8 shrink-0 flex-col gap-[3px] pr-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className="h-[11px] text-right text-[9px] leading-[11px] text-fg-subtle">
                  {WEEKDAY_LABELS[i] ?? ''}
                </span>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex shrink-0 flex-col gap-[3px]">
                {week.map((day) => {
                  if (day.future) return <span key={day.key} className="h-[11px] w-[11px]" />;
                  const level = levelFor(day.value, maxValue);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onMouseEnter={() => setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(day)}
                      onBlur={() => setHovered(null)}
                      aria-label={`${format(day.date, 'MMM d, yyyy')}: ${day.value} activity`}
                      className={cn(
                        'h-[11px] w-[11px] rounded-[2px] transition-transform duration-fast',
                        'hover:scale-[1.35] focus-visible:scale-[1.35]',
                      )}
                      style={{
                        backgroundColor: stepColor(level),
                        // 2px surface ring on the hovered mark, per the spacer
                        // rule — it reads as separation, not as a bigger value.
                        boxShadow: hovered?.key === day.key ? `0 0 0 1.5px ${palette.color('accent')}` : undefined,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-h-[1rem] text-xs text-fg-muted">
          {hovered ? (
            <>
              <span className="font-medium text-fg">
                {hovered.value === 0 ? 'No activity' : `${hovered.value} activity`}
              </span>{' '}
              on {format(hovered.date, 'MMM d, yyyy')}
            </>
          ) : (
            `${totalActiveDays} active days in the last year`
          )}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-fg-subtle">
          Less
          {Array.from({ length: LEVELS + 1 }).map((_, level) => (
            <span
              key={level}
              className="h-[11px] w-[11px] rounded-[2px]"
              style={{ backgroundColor: stepColor(level) }}
            />
          ))}
          More
        </div>
      </div>
    </div>
  );
}

function StreakFigure({ value, label, unit = 'd', emphasis = false }) {
  return (
    <div className="flex items-baseline gap-1.5">
      {emphasis && value > 0 && (
        <IoFlameOutline className="self-center text-base text-warning-border" aria-hidden="true" />
      )}
      <span
        className={cn(
          'font-mono text-xl font-semibold tabular-nums',
          emphasis && value > 0 ? 'text-warning-border' : 'text-fg',
        )}
      >
        {value}
        {unit && <span className="text-sm font-normal text-fg-subtle">{unit}</span>}
      </span>
      <span className="text-xs text-fg-muted">{label}</span>
    </div>
  );
}
