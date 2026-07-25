import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  IoAddOutline,
  IoCodeSlashOutline,
  IoFlameOutline,
  IoFlashOutline,
  IoHelpBuoyOutline,
  IoRibbonOutline,
  IoTrendingUpOutline,
  IoTrophyOutline,
} from 'react-icons/io5';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Badge, Button, Card, DifficultyBadge, Skeleton, StatCard } from '../../components/ui';
import { Panel } from '../../components/layout/Panel';
import { StreakHeatmap } from '../../components/charts/StreakHeatmap';
import { cn } from '../../lib/cn';

const DESTINATIONS = [
  { to: '/problems', label: 'Arena', desc: 'Practice problems', icon: IoFlashOutline },
  { to: '/contests', label: 'Battle', desc: 'Timed contests', icon: IoTrophyOutline },
  { to: '/queries', label: 'Queries', desc: 'Get unstuck', icon: IoHelpBuoyOutline },
  { to: '/playground', label: 'Playground', desc: 'Pair-program live', icon: IoCodeSlashOutline },
];

/**
 * The landing screen for a signed-in user. Deliberately a launchpad rather
 * than another data table — the feature pages already do that job, and the
 * first thing after sign-in should be a way in, not a wall of rows.
 */
export function Home() {
  const { account, userId } = useAuth();

  const loadRank = useCallback(() => (userId ? api.users.rank(userId) : Promise.resolve(null)), [userId]);
  const { data: rank } = useAsync(loadRank, [loadRank]);

  const loadProblems = useCallback(() => api.problems.listAll(), []);
  const { data: problems, loading: problemsLoading } = useAsync(loadProblems, [loadProblems]);

  const loadLeaders = useCallback(() => api.users.listAllByPoints(), []);
  const { data: leaders, loading: leadersLoading } = useAsync(loadLeaders, [loadLeaders]);

  const loadActivity = useCallback(() => (userId ? api.users.activity(userId) : Promise.resolve(null)), [userId]);
  const { data: activityData } = useAsync(loadActivity, [loadActivity]);

  const recentProblems = (problems ?? []).slice(-5).reverse();
  const topUsers = (leaders ?? []).slice(0, 5);
  const firstName = (account?.nickname || account?.username || '').split(/[\s_]/)[0];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar src={account?.picture} name={account?.username} size="lg" ring />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-fg">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-0.5 text-sm text-fg-muted">
              @{account?.username} · pick up where you left off
            </p>
          </div>
        </div>
        <Link to={userId ? `/u/${userId}` : '/home'}>
          <Button variant="secondary" iconLeft={<IoRibbonOutline />}>
            View full profile
          </Button>
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Points" value={account?.points ?? 0} icon={<IoFlashOutline />} tone="accent" />
        <StatCard
          label="Global rank"
          value={rank != null ? `#${rank}` : '—'}
          icon={<IoTrendingUpOutline />}
          tone="info"
        />
        <StatCard
          label="Streak"
          value={`${activityData?.stats?.currentStreak ?? 0}d`}
          hint={`Longest ${activityData?.stats?.longestStreak ?? 0}d`}
          icon={<IoFlameOutline />}
          tone="warning"
        />
        <StatCard label="Rating" value={account?.rating ?? '—'} icon={<IoRibbonOutline />} tone="success" />
      </section>

      <Panel title="Your year" icon={<IoFlameOutline />} bodyClassName="p-4">
        <StreakHeatmap activity={activityData?.activity ?? []} stats={activityData?.stats} />
      </Panel>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DESTINATIONS.map((d) => (
          <Card as={Link} to={d.to} key={d.to} interactive className="flex flex-col gap-2 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-border/30 bg-accent-soft text-xl text-accent-border shadow-[var(--glow-accent-sm)]">
              <d.icon aria-hidden="true" />
            </span>
            <span className="font-semibold text-fg">{d.label}</span>
            <span className="text-xs text-fg-muted">{d.desc}</span>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Latest problems"
          icon={<IoFlashOutline />}
          actions={
            <Link to="/problems/new">
              <Button size="xs" variant="ghost" iconLeft={<IoAddOutline />}>
                New
              </Button>
            </Link>
          }
        >
          {problemsLoading ? (
            <ListSkeleton />
          ) : recentProblems.length === 0 ? (
            <EmptyRow message="No problems yet — add the first one." to="/problems/new" cta="Create a problem" />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {recentProblems.map((p) => (
                <li key={p._id}>
                  <Link
                    to={`/problems/${p._id}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-accent-soft"
                  >
                    <span className="truncate text-sm text-fg">{p.title || p.name}</span>
                    <DifficultyBadge difficulty={p.tag} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Leaderboard"
          icon={<IoTrophyOutline />}
          actions={
            <Link to="/connect">
              <Button size="xs" variant="ghost">
                See all
              </Button>
            </Link>
          }
        >
          {leadersLoading ? (
            <ListSkeleton />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {topUsers.map((u, i) => (
                <li key={u._id}>
                  <Link
                    to={`/u/${u._id}`}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent-soft"
                  >
                    <span
                      className={cn(
                        'w-5 shrink-0 text-center font-mono text-xs',
                        i === 0 ? 'text-medium' : 'text-fg-subtle',
                      )}
                    >
                      {i + 1}
                    </span>
                    <Avatar src={u.picture} name={u.username} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm text-fg">{u.nickname || u.username}</span>
                    <Badge variant="accent">{u.points}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

function EmptyRow({ message, to, cta }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-sm text-fg-muted">{message}</p>
      <Link to={to}>
        <Button size="sm" variant="secondary">
          {cta}
        </Button>
      </Link>
    </div>
  );
}
