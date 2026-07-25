import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/layout/PageHeader';
import { Panel } from '../../components/layout/Panel';
import { Table, Button, TableSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { cn } from '../../lib/cn';

export function ContestRankings() {
  const { id } = useParams();
  const loadContest = useCallback(() => api.contests.get(id), [id]);
  const { data: contest, loading: contestLoading, error: contestError, refetch: refetchContest } = useAsync(loadContest, [loadContest]);

  const loadRankings = useCallback(() => api.contests.rankings(id), [id]);
  const { data: rankings, loading: rankLoading, error: rankError, refetch: refetchRank } = useAsync(loadRankings, [loadRankings]);

  const columns = useMemo(() => {
    if (!contest) return [];
    return [
      { key: 'rank', header: 'Rank', className: 'w-16', render: (row) => `#${row.rank}` },
      { key: 'name', header: 'Name', render: (row) => row.name },
      ...contest.problems.map((prob, i) => ({
        key: prob._id,
        header: `P${i + 1}`,
        className: 'w-12 text-center',
        render: (row) => {
          const solved = row.problemStatuses.find((p) => p.problemId === prob._id)?.solved;
          return (
            <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded', solved ? 'bg-success/20 text-success-border' : 'bg-danger/10 text-danger-border')}>
              {solved ? '✓' : '✕'}
            </span>
          );
        },
      })),
      { key: 'resultPoints', header: 'Points', sortable: true, render: (row) => row.resultPoints },
    ];
  }, [contest]);

  const loading = contestLoading || rankLoading;
  const error = contestError || rankError;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={contest ? `${contest.name} — Rankings` : 'Rankings'}
        actions={
          <Link to={`/contests/${id}`}>
            <Button variant="secondary" size="sm">
              Problems
            </Button>
          </Link>
        }
      />
      <Panel className="mx-6 mb-6 flex-1" scroll>
        {loading && <TableSkeleton rows={8} cols={4} />}
        {error && <ErrorState error={error} onRetry={() => { refetchContest(); refetchRank(); }} />}
        {!loading && !error && (!rankings || rankings.length === 0) && (
          <EmptyState icon="🏆" title="No participants yet" />
        )}
        {!loading && !error && rankings?.length > 0 && contest && (
          <Table rowKey={(row) => `${row.rank}-${row.name}`} data={rankings} columns={columns} />
        )}
      </Panel>
    </div>
  );
}
