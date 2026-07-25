import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoAddOutline, IoHelpBuoyOutline, IoSearchOutline } from 'react-icons/io5';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/layout/PageHeader';
import { FilterBar, FilterPills } from '../../components/layout/FilterBar';
import { Input, Button, Select, CardGridSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { QueryCard } from './QueryCard';
import { QUERY_TAGS } from '../../lib/constants';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unsolved', label: 'Open' },
  { id: 'solved', label: 'Solved' },
  { id: 'mine-asked', label: 'Asked by me' },
  { id: 'mine-solved', label: 'Solved by me' },
];

export function QueryList() {
  const { userId } = useAuth();
  const loadQueries = useCallback(() => api.queries.list(), []);
  const { data: queries, loading, error, refetch } = useAsync(loadQueries, [loadQueries]);

  const [status, setStatus] = useState('all');
  const [tag, setTag] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  const idOf = (entity) => (typeof entity === 'object' ? entity?._id : entity);

  const filtered = useMemo(() => {
    if (!queries) return [];
    return queries.filter((q) => {
      if (status === 'unsolved' && q.status !== 'unsolved') return false;
      if (status === 'solved' && q.status !== 'solved') return false;
      if (status === 'mine-asked' && idOf(q.author) !== userId) return false;
      if (status === 'mine-solved' && idOf(q.solver) !== userId) return false;
      if (tag !== 'all' && q.tag !== tag) return false;
      if (debouncedSearch && !(q.title ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      return true;
    });
  }, [queries, status, tag, debouncedSearch, userId]);

  const openCount = useMemo(() => (queries ?? []).filter((q) => q.status !== 'solved').length, [queries]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Queries"
        icon={<IoHelpBuoyOutline />}
        description={queries ? `${openCount} open · ${queries.length} total` : 'Ask and answer, staked on points.'}
        actions={
          <Link to="/queries/new">
            <Button iconLeft={<IoAddOutline />}>Post a query</Button>
          </Link>
        }
      />

      <FilterBar>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title…"
          prefix={<IoSearchOutline />}
          className="w-56"
        />
        <Select value={tag} onChange={(e) => setTag(e.target.value)} className="!w-44">
          <option value="all">All categories</option>
          {QUERY_TAGS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <FilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />
      </FilterBar>

      <div className="themed-scrollbar flex-1 overflow-y-auto px-6 pb-6">
        {loading && <CardGridSkeleton count={6} />}
        {error && <ErrorState error={error} onRetry={refetch} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<IoHelpBuoyOutline />}
            title="No queries match"
            description="Try clearing a filter, or post the first one and stake some points on it."
            action={
              <Link to="/queries/new">
                <Button variant="secondary" iconLeft={<IoAddOutline />}>
                  Post a query
                </Button>
              </Link>
            }
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((q) => (
              <QueryCard key={q._id} query={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
