import { useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  Filler,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from 'chart.js';
import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns';
import { EmptyState } from '../ui';
import { useChartTheme, baseChartOptions } from './chartTheme';
import { cn } from '../../lib/cn';

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

/**
 * Weekly activity over the trailing N weeks.
 *
 * One series, so no legend — the panel title names it. Weekly buckets rather
 * than daily: a year of daily points is 365 marks in a 200px-tall box, which
 * reads as noise; the heatmap next to it is where per-day detail belongs.
 */
export function ActivityTrendChart({ activity = [], weeks = 16, className }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const palette = useChartTheme();

  const { labels, values, hasData } = useMemo(() => {
    const byDate = new Map();
    for (const item of activity) {
      if (item?.date) byDate.set(item.date, (byDate.get(item.date) ?? 0) + (Number(item.value) || 0));
    }

    const firstWeek = startOfWeek(subWeeks(new Date(), weeks - 1));
    const buckets = [];
    for (let w = 0; w < weeks; w += 1) {
      const start = addWeeks(firstWeek, w);
      let total = 0;
      for (let d = 0; d < 7; d += 1) {
        total += byDate.get(format(addDays(start, d), 'yyyy-MM-dd')) ?? 0;
      }
      buckets.push({ label: format(start, 'MMM d'), total });
    }

    return {
      labels: buckets.map((b) => b.label),
      values: buckets.map((b) => b.total),
      hasData: buckets.some((b) => b.total > 0),
    };
  }, [activity, weeks]);

  useEffect(() => {
    if (!canvasRef.current || !hasData) return undefined;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext('2d');
    const accent = palette.color('accent');

    // Vertical fade under the line — an area fill at full strength swamps the
    // 2px stroke that actually carries the shape.
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current.height || 200);
    gradient.addColorStop(0, palette.color('accent', 0.28));
    gradient.addColorStop(1, palette.color('accent', 0));

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: accent,
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: accent,
            pointHoverBorderColor: palette.color('surface'),
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        ...baseChartOptions(palette),
        plugins: {
          ...baseChartOptions(palette).plugins,
          tooltip: {
            ...baseChartOptions(palette).plugins.tooltip,
            callbacks: {
              title: (items) => `Week of ${items[0].label}`,
              label: (item) => `${item.raw} activity`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: palette.axis },
            ticks: {
              color: palette.textSubtle,
              font: { size: 10 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: palette.grid, drawTicks: false },
            border: { display: false, dash: undefined },
            ticks: { color: palette.textSubtle, font: { size: 10 }, maxTicksLimit: 4, padding: 6 },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, values, hasData, palette]);

  if (!hasData) {
    return (
      <EmptyState
        title="No activity yet"
        description="Solve a problem or answer a query and it shows up here."
        className={className}
      />
    );
  }

  return (
    <div className={cn('relative', className)}>
      <canvas ref={canvasRef} role="img" aria-label={`Weekly activity over the last ${weeks} weeks`} />
    </div>
  );
}
