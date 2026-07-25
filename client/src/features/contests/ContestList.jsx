import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoAddOutline, IoTrophyOutline } from 'react-icons/io5';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Panel } from '../../components/layout/Panel';
import { FilterBar, FilterPills } from '../../components/layout/FilterBar';
import { Table, Badge, Button, TableSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { formatDateTime, formatDuration } from '../../lib/format';
import { CONTEST_STATE } from '../../lib/constants';

const STATE_VARIANT = { upcoming: 'info', live: 'success', ended: 'neutral' };

const STATE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ended', label: 'Ended' },
];

export function ContestList() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [state, setState] = useState('all');
  const [entering, setEntering] = useState(null);

  const loadContests = useCallback(() => api.contests.list(), []);
  const { data: contests, loading, error, refetch } = useAsync(loadContests, [loadContests]);

  const filtered = useMemo(() => {
    if (!contests) return [];
    if (state === 'all') return contests;
    return contests.filter((c) => CONTEST_STATE[c.message]?.key === state);
  }, [contests, state]);

  const handleEnter = async (contestId) => {
    setEntering(contestId);
    try {
      await api.contests.register(contestId, userId);
      navigate(`/contests/${contestId}`, { state: { cid: contestId } });
    } catch (err) {
      toast.error(err.message || 'Could not enter the contest.');
    } finally {
      setEntering(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Battle"
        icon={<IoTrophyOutline />}
        description="Timed contests with a live leaderboard."
        actions={
          <Link to="/contests/new">
            <Button iconLeft={<IoAddOutline />}>Create contest</Button>
          </Link>
        }
      />

      <FilterBar>
        <FilterPills options={STATE_FILTERS} value={state} onChange={setState} />
      </FilterBar>

      <Panel className="mx-6 mb-6 flex-1" scroll>
        {loading && <TableSkeleton rows={6} cols={5} />}
        {error && <ErrorState error={error} onRetry={refetch} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<IoTrophyOutline />}
            title={state === 'all' ? 'No contests yet' : `No ${state} contests`}
            description="Set a window, attach some problems, and invite people to compete."
            action={
              <Link to="/contests/new">
                <Button variant="secondary" iconLeft={<IoAddOutline />}>
                  Create a contest
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
                key: 'name',
                header: 'Name',
                sortable: true,
                render: (row) => (
                  <Link
                    to={`/contests/${row._id}`}
                    className="font-medium text-fg transition-colors hover:text-accent-border"
                  >
                    {row.name}
                  </Link>
                ),
              },
              {
                key: 'author',
                header: 'Author',
                className: 'hidden md:table-cell',
                render: (row) => <span className="text-fg-muted">{row.author?.username ?? '—'}</span>,
              },
              {
                key: 'start',
                header: 'Start',
                sortable: true,
                sortValue: (row) => new Date(row.start).getTime(),
                className: 'hidden sm:table-cell',
                render: (row) => <span className="text-fg-muted">{formatDateTime(row.start)}</span>,
              },
              {
                key: 'length',
                header: 'Length',
                className: 'hidden lg:table-cell',
                render: (row) => (
                  <span className="font-mono tabular-nums text-fg-muted">{formatDuration(row.start, row.end)}</span>
                ),
              },
              {
                key: 'state',
                header: 'Status',
                render: (row) => {
                  const s = CONTEST_STATE[row.message] ?? CONTEST_STATE.secondary;
                  return (
                    <Badge variant={STATE_VARIANT[s.key]} dot={s.key === 'live'}>
                      {s.label}
                    </Badge>
                  );
                },
              },
              {
                key: 'actions',
                header: '',
                render: (row) => {
                  const s = CONTEST_STATE[row.message]?.key;
                  if (s !== 'live') {
                    return (
                      <Link to={`/contests/${row._id}/rankings`}>
                        <Button size="sm" variant="ghost">
                          Rankings
                        </Button>
                      </Link>
                    );
                  }
                  return (
                    <Button size="sm" loading={entering === row._id} onClick={() => handleEnter(row._id)}>
                      Enter
                    </Button>
                  );
                },
              },
            ]}
          />
        )}
      </Panel>
    </div>
  );
}
