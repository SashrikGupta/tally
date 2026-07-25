import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { PageHeader } from '../../components/layout/PageHeader';
import { Panel } from '../../components/layout/Panel';
import { Table, DifficultyBadge, Button, TableSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { truncateWords } from '../../lib/format';

export function ContestDetail() {
  const { id } = useParams();
  const loadContest = useCallback(() => api.contests.get(id), [id]);
  const { data: contest, loading, error, refetch } = useAsync(loadContest, [loadContest]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={loading ? 'Loading…' : contest?.name ?? 'Contest'}
        actions={
          <Link to={`/contests/${id}/rankings`}>
            <Button variant="secondary" size="sm">
              Global rankings
            </Button>
          </Link>
        }
      />
      <Panel className="mx-6 mb-6 flex-1" scroll>
        {loading && <TableSkeleton rows={6} cols={4} />}
        {error && <ErrorState error={error} onRetry={refetch} />}
        {!loading && !error && contest?.problems?.length === 0 && (
          <EmptyState icon="📭" title="No problems in this contest yet" />
        )}
        {!loading && !error && contest?.problems?.length > 0 && (
          <Table
            rowKey={(row) => row._id}
            data={contest.problems}
            columns={[
              { key: 'name', header: 'Problem', render: (row) => row.name },
              { key: 'desc', header: 'Description', render: (row) => <span className="text-fg-muted">{truncateWords(row.desc, 8)}</span> },
              { key: 'tag', header: 'Difficulty', render: (row) => <DifficultyBadge difficulty={row.tag} /> },
              {
                key: 'action',
                header: '',
                render: (row) => (
                  <Link to={`/problems/${row._id}`} state={{ cid: contest._id }}>
                    <Button size="sm">Solve</Button>
                  </Link>
                ),
              },
            ]}
          />
        )}
      </Panel>
    </div>
  );
}
