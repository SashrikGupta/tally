import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IoSearchOutline,
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoFlashOutline,
  IoAddOutline,
} from 'react-icons/io5';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/layout/PageHeader';
import { Panel } from '../../components/layout/Panel';
import { FilterBar, FilterPills } from '../../components/layout/FilterBar';
import { Table, Input, Button, DifficultyBadge, TableSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { truncateWords } from '../../lib/format';
import { DIFFICULTIES } from '../../lib/constants';

export function ProblemList() {
  const { userId } = useAuth();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const debouncedSearch = useDebounce(search, 200);

  const loadProblems = useCallback(() => api.problems.listAll(), []);
  const { data: problems, loading, error, refetch } = useAsync(loadProblems, [loadProblems]);

  const loadSolved = useCallback(() => (userId ? api.problems.solvedByUser(userId) : Promise.resolve([])), [userId]);
  const { data: solvedCodes } = useAsync(loadSolved, [loadSolved]);

  const solvedIds = useMemo(() => new Set((solvedCodes ?? []).map((c) => c.problem?._id)), [solvedCodes]);

  const filtered = useMemo(() => {
    if (!problems) return [];
    return problems.filter((p) => {
      const matchesDifficulty = difficulty === 'All' || p.tag === difficulty;
      const matchesSearch = (p.name ?? '').toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesDifficulty && matchesSearch;
    });
  }, [problems, difficulty, debouncedSearch]);

  const solvedCount = useMemo(
    () => (problems ?? []).filter((p) => solvedIds.has(p._id)).length,
    [problems, solvedIds],
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Arena"
        icon={<IoFlashOutline />}
        description={
          problems ? `${solvedCount} of ${problems.length} solved` : 'A permanent library of practice problems.'
        }
        actions={
          <>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems…"
              prefix={<IoSearchOutline />}
              className="w-56"
            />
            <Link to="/problems/new">
              <Button iconLeft={<IoAddOutline />}>New problem</Button>
            </Link>
          </>
        }
      />

      <FilterBar>
        <FilterPills options={['All', ...DIFFICULTIES]} value={difficulty} onChange={setDifficulty} />
      </FilterBar>

      <Panel className="mx-6 mb-6 flex-1" scroll>
        {loading && <TableSkeleton rows={8} cols={5} />}
        {error && <ErrorState error={error} onRetry={refetch} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<IoFlashOutline />}
            title="No problems found"
            description="Try a different search or filter — or add the first problem yourself."
            action={
              <Link to="/problems/new">
                <Button variant="secondary" iconLeft={<IoAddOutline />}>
                  Create a problem
                </Button>
              </Link>
            }
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <Table
            rowKey={(row) => row._id}
            data={filtered}
            columns={[
              {
                key: 'status',
                header: '',
                className: 'w-8',
                render: (row) =>
                  solvedIds.has(row._id) ? (
                    <IoCheckmarkCircle className="text-success-border" title="Solved" />
                  ) : (
                    <IoEllipseOutline className="text-fg-subtle" title="Unsolved" />
                  ),
              },
              {
                key: 'name',
                header: 'Problem',
                sortable: true,
                render: (row) => (
                  <Link
                    to={`/problems/${row._id}`}
                    className="font-medium text-fg transition-colors hover:text-accent-border"
                  >
                    {row.name}
                  </Link>
                ),
              },
              {
                key: 'desc',
                header: 'Description',
                className: 'hidden md:table-cell',
                render: (row) => <span className="text-fg-muted">{truncateWords(row.desc, 10)}</span>,
              },
              {
                key: 'tag',
                header: 'Difficulty',
                sortable: true,
                render: (row) => <DifficultyBadge difficulty={row.tag} />,
              },
              {
                key: 'points',
                header: 'Points',
                sortable: true,
                render: (row) => <span className="font-mono tabular-nums text-fg-muted">{row.points}</span>,
              },
            ]}
          />
        )}
      </Panel>
    </div>
  );
}
