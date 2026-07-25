import { useState } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoHardwareChipOutline, IoTimerOutline } from 'react-icons/io5';
import { Tabs } from '../../components/ui';
import { cn } from '../../lib/cn';

/**
 * Tabbed Input / Output / Test Results / Metrics panel. Replaces the old
 * imperative `document.getElementById('out2').value = ...` DOM writes with
 * ordinary React-controlled state.
 */
export function OutputPanel({
  input,
  onInputChange,
  output,
  errorText,
  testResults,
  metrics,
  className,
}) {
  const tabs = [
    { id: 'input', label: 'Input' },
    { id: 'output', label: errorText ? 'Errors' : 'Output' },
    ...(testResults ? [{ id: 'tests', label: `Tests (${testResults.passed}/${testResults.total})` }] : []),
    ...(metrics ? [{ id: 'metrics', label: 'Metrics' }] : []),
  ];
  const [tab, setTab] = useState('input');

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="px-2" />
      <div className="min-h-0 flex-1 overflow-y-auto themed-scrollbar p-3">
        {tab === 'input' && (
          <textarea
            value={input}
            onChange={(e) => onInputChange?.(e.target.value)}
            readOnly={!onInputChange}
            placeholder="Custom input passed to your program's stdin…"
            className="h-full w-full resize-none rounded-md border border-border bg-inset p-2.5 font-mono text-sm text-fg outline-none transition-all duration-fast placeholder:text-fg-subtle focus:border-accent-border focus:shadow-[var(--glow-accent-sm)]"
          />
        )}
        {tab === 'output' && (
          <pre
            className={cn(
              'h-full w-full overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-inset p-2.5 font-mono text-sm',
              errorText ? 'text-danger-border' : 'text-fg',
            )}
          >
            {errorText || output || 'Run your code to see output here.'}
          </pre>
        )}
        {tab === 'tests' && testResults && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-slow ease-out',
                    testResults.passed === testResults.total ? 'bg-success-border' : 'bg-warning-border',
                  )}
                  style={{ width: `${(testResults.passed / Math.max(testResults.total, 1)) * 100}%` }}
                />
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-fg-muted">
                {testResults.passed}/{testResults.total}
              </span>
            </div>
            <ul className="stagger flex flex-col gap-1.5">
              {testResults.cases.map((c, i) => (
                <li
                  key={i}
                  className={cn(
                    'flex items-center justify-between rounded-md border px-3 py-1.5 text-sm',
                    c.passed
                      ? 'border-success-border/40 bg-success/10 text-success-border'
                      : 'border-danger-border/40 bg-danger/10 text-danger-border',
                  )}
                >
                  <span>Test case {i + 1}</span>
                  <span className="flex items-center gap-1.5">
                    {c.passed ? <IoCheckmarkCircle /> : <IoCloseCircle />}
                    {c.passed ? 'Passed' : 'Failed'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'metrics' && metrics && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-border bg-inset p-3">
              <dt className="flex items-center gap-1.5 text-xs text-fg-muted">
                <IoTimerOutline aria-hidden="true" /> Execution time
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-fg">
                {metrics.timeMs ?? '—'} ms
              </dd>
            </div>
            <div className="rounded-md border border-border bg-inset p-3">
              <dt className="flex items-center gap-1.5 text-xs text-fg-muted">
                <IoHardwareChipOutline aria-hidden="true" /> Memory used
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-fg">
                {metrics.memoryMb ?? '—'} MB
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
