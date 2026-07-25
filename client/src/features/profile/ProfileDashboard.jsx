import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  IoCalendarOutline,
  IoFlameOutline,
  IoHelpBuoyOutline,
  IoCheckmarkOutline,
  IoFlashOutline,
  IoPersonAddOutline,
  IoPersonRemoveOutline,
  IoRibbonOutline,
  IoSettingsOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Panel } from '../../components/layout/Panel';
import { Avatar, Badge, Button, Card, ErrorState, Skeleton, StatCard } from '../../components/ui';
import { DifficultyBreakdown } from '../../components/charts/DifficultyBreakdown';
import { StreakHeatmap } from '../../components/charts/StreakHeatmap';
import { ActivityTrendChart } from '../../components/charts/ActivityTrendChart';
import { QueryBreakdownChart } from '../../components/charts/QueryBreakdownChart';

export function ProfileDashboard() {
  const { id } = useParams();
  const { userId: myId } = useAuth();
  const toast = useToast();

  const loadUser = useCallback(() => api.users.get(id), [id]);
  const { data: user, loading, error, refetch } = useAsync(loadUser, [loadUser]);

  const loadRank = useCallback(() => api.users.rank(id), [id]);
  const { data: rank } = useAsync(loadRank, [loadRank]);

  const loadQueryStats = useCallback(() => api.users.queryStats(id), [id]);
  const { data: queryStats } = useAsync(loadQueryStats, [loadQueryStats]);

  const loadProblemStats = useCallback(() => api.problems.statsByUser(id), [id]);
  const { data: problemStats } = useAsync(loadProblemStats, [loadProblemStats]);

  const loadActivity = useCallback(() => api.users.activity(id), [id]);
  const { data: activityData } = useAsync(loadActivity, [loadActivity]);

  // Follow state is optimistic: the button flips immediately and rolls back if
  // the request fails, because a follow round trip writes two documents and is
  // slow enough that waiting feels broken.
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followPending, setFollowPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    const followers = user.followed ?? [];
    setFollowerCount(followers.length);
    setFollowing(followers.some((f) => (typeof f === 'object' ? f._id : f) === myId));
  }, [user, myId]);

  const isYou = myId === id;

  const toggleFollow = async () => {
    const optimistic = !following;
    setFollowing(optimistic);
    setFollowerCount((c) => c + (optimistic ? 1 : -1));
    setFollowPending(true);
    try {
      const result = await api.users.toggleFollow(myId, id);
      setFollowing(result.following);
      setFollowerCount(result.followerCount);
    } catch (err) {
      setFollowing(!optimistic);
      setFollowerCount((c) => c + (optimistic ? -1 : 1));
      toast.error(err.message || 'Could not update your follow.');
    } finally {
      setFollowPending(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorState error={error} onRetry={refetch} className="h-full" />;
  if (!user) return null;

  return (
    <div className="themed-scrollbar h-full overflow-y-auto">
      {/* Banner: the accent wash makes the page read as a profile rather than
          another list screen, without needing a user-uploaded cover image. */}
      <div className="relative h-32 border-b border-border-subtle bg-gradient-to-br from-accent/40 via-accent/10 to-transparent sm:h-40" />

      <div className="mx-auto -mt-14 flex w-full max-w-6xl flex-col gap-5 px-6 pb-8 sm:-mt-16">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar
              src={user.picture}
              name={user.username}
              size="xl"
              className="border-4 border-base-solid shadow-[var(--shadow-lg),var(--glow-accent-sm)]"
            />
            <div className="pb-1">
              <h1 className="text-2xl font-semibold tracking-tight text-fg">{user.nickname || user.username}</h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
                <span>@{user.username}</span>
                {user.year && (
                  <span className="flex items-center gap-1">
                    <IoCalendarOutline aria-hidden="true" />
                    {user.year}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-1">
            {isYou ? (
              <Link to="/settings">
                <Button variant="secondary" iconLeft={<IoSettingsOutline />}>
                  Edit profile
                </Button>
              </Link>
            ) : (
              <Button
                variant={following ? 'secondary' : 'primary'}
                loading={followPending}
                onClick={toggleFollow}
                iconLeft={following ? <IoCheckmarkOutline /> : <IoPersonAddOutline />}
                className="group"
              >
                <span className={following ? 'group-hover:hidden' : undefined}>
                  {following ? 'Following' : 'Follow'}
                </span>
                {following && (
                  <span className="hidden items-center gap-1.5 group-hover:inline-flex">
                    <IoPersonRemoveOutline /> Unfollow
                  </span>
                )}
              </Button>
            )}
          </div>
        </header>

        {user.description && (
          <Card className="p-4">
            <p className="text-sm leading-relaxed text-fg-muted">{user.description}</p>
          </Card>
        )}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Points" value={user.points ?? 0} icon={<IoFlashOutline />} tone="accent" />
          <StatCard
            label="Rank"
            value={rank != null ? `#${rank}` : '—'}
            icon={<IoTrendingUpOutline />}
            tone="info"
          />
          <StatCard label="Rating" value={user.rating ?? '—'} icon={<IoRibbonOutline />} tone="success" />
          <StatCard label="Followers" value={followerCount} tone="warning" />
          <StatCard label="Following" value={(user.following ?? []).length} tone="danger" />
        </section>

        <Panel title="Streak" icon={<IoFlameOutline />} bodyClassName="p-4">
          <StreakHeatmap activity={activityData?.activity ?? []} stats={activityData?.stats} />
        </Panel>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Problems solved" icon={<IoFlashOutline />} bodyClassName="p-4">
            <DifficultyBreakdown stats={problemStats} />
          </Panel>
          <Panel title="Query activity" icon={<IoHelpBuoyOutline />} bodyClassName="p-4">
            <QueryBreakdownChart
              total={queryStats?.totalQueries ?? 0}
              asked={queryStats?.totalAskedQueries ?? 0}
              solved={queryStats?.totalSolvedQueries ?? 0}
            />
          </Panel>
          <Panel title="Weekly trend" icon={<IoTrendingUpOutline />} bodyClassName="p-4">
            <ActivityTrendChart activity={activityData?.activity ?? []} className="h-48" />
          </Panel>
        </section>

        {queryStats?.tagCounts && (
          <Panel title="Query categories" bodyClassName="flex flex-wrap gap-2 p-4">
            {Object.entries(queryStats.tagCounts)
              .filter(([, count]) => count > 0)
              .map(([name, count]) => (
                <Badge key={name} variant="neutral">
                  {name} · {count}
                </Badge>
              ))}
            {Object.values(queryStats.tagCounts).every((c) => c === 0) && (
              <span className="text-sm text-fg-subtle">No queries yet.</span>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-32 border-b border-border-subtle bg-overlay sm:h-40" />
      <div className="mx-auto -mt-14 flex w-full max-w-6xl flex-col gap-5 px-6 sm:-mt-16">
        <div className="flex items-end gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex flex-col gap-2 pb-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}
