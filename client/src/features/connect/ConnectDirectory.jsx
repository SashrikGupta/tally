import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoPeopleOutline, IoSearchOutline } from 'react-icons/io5';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { PageHeader } from '../../components/layout/PageHeader';
import { Avatar, Badge, Card, Input, CardGridSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { cn } from '../../lib/cn';

/** Podium colours for the top three by points. */
const MEDAL = ['text-medium', 'text-fg-muted', 'text-warning-border'];

export function ConnectDirectory() {
  const { userId } = useAuth();
  const loadUsers = useCallback(() => api.users.listAllByPoints(), []);
  const { data: users, loading, error, refetch } = useAsync(loadUsers, [loadUsers]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);

  // Rank is assigned before filtering so searching for one person still shows
  // their true position in the leaderboard, not "#1 of the filtered set".
  const ranked = useMemo(() => (users ?? []).map((u, i) => ({ ...u, rank: i + 1 })), [users]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return ranked;
    const needle = debouncedSearch.toLowerCase();
    return ranked.filter(
      (u) =>
        (u.username ?? '').toLowerCase().includes(needle) || (u.nickname ?? '').toLowerCase().includes(needle),
    );
  }, [ranked, debouncedSearch]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Connect"
        icon={<IoPeopleOutline />}
        description={users ? `${users.length} members, ranked by points` : 'Everyone on CodeConnect.'}
        actions={
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            prefix={<IoSearchOutline />}
            className="w-56"
          />
        }
      />

      <div className="themed-scrollbar flex-1 overflow-y-auto px-6 py-4">
        {loading && <CardGridSkeleton count={9} />}
        {error && <ErrorState error={error} onRetry={refetch} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<IoPeopleOutline />}
            title="No members found"
            description="Nobody here matches that search."
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((u) => (
              <Card
                key={u._id}
                as={Link}
                to={`/u/${u._id}`}
                interactive
                className={cn(
                  'flex items-center gap-3 p-4',
                  u._id === userId && 'border-accent-border/60 shadow-[var(--shadow-md),var(--glow-accent-sm)]',
                )}
              >
                <span
                  className={cn(
                    'w-7 shrink-0 text-center font-mono text-sm font-semibold tabular-nums',
                    MEDAL[u.rank - 1] ?? 'text-fg-subtle',
                  )}
                >
                  {u.rank}
                </span>
                <Avatar src={u.picture} name={u.username} ring={u._id === userId} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium text-fg">{u.nickname || u.username}</span>
                    {u._id === userId && <Badge variant="accent">You</Badge>}
                  </div>
                  <div className="truncate text-xs text-fg-subtle">@{u.username}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="accent">{u.points}</Badge>
                  <span className="text-[11px] text-fg-subtle">★ {u.rating}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
