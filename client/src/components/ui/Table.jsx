import { useMemo, useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * columns: [{ key, header, render?(row), sortable?, className? }]
 * rowKey: (row) => string | number
 */
export function Table({ columns, data, rowKey, className, stickyHeader = true, onRowClick }) {
  const [sort, setSort] = useState(null); // { key, dir }

  const rows = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    const accessor = col?.sortValue ?? ((row) => row[sort.key]);
    return [...data].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av === bv) return 0;
      const result = av > bv ? 1 : -1;
      return sort.dir === 'asc' ? result : -result;
    });
  }, [data, sort, columns]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)}>
        <thead className={cn(stickyHeader && 'sticky top-0 z-10 bg-panel')}>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                className={cn(
                  'whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fg-muted',
                  col.sortable && 'cursor-pointer select-none hover:text-fg',
                  col.className,
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sort?.key === col.key && <span>{sort.dir === 'asc' ? '▲' : '▼'}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border-subtle',
                onRowClick && 'cursor-pointer hover:bg-overlay',
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-3 py-2 align-middle', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
