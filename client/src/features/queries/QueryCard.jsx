import { Link } from 'react-router-dom';
import { IoCheckmarkCircleOutline, IoTimeOutline } from 'react-icons/io5';
import { Avatar, Badge, Card } from '../../components/ui';
import { truncateWords } from '../../lib/format';
import { QUERY_TAGS } from '../../lib/constants';

const TAG_LABEL = Object.fromEntries(QUERY_TAGS.map((t) => [t.value, t.label]));

/** Author/solver may arrive populated or as a bare id, depending on endpoint. */
function person(entity) {
  if (!entity) return null;
  return typeof entity === 'object' ? entity : { username: String(entity) };
}

export function QueryCard({ query }) {
  const solved = query.status === 'solved';
  const author = person(query.author);
  const solver = person(query.solver);

  return (
    <Card
      as={Link}
      to={`/queries/${query._id}`}
      interactive
      className="group relative flex flex-col gap-3 overflow-hidden p-4"
    >
      {/* Status rail down the left edge — readable at a glance in a grid. */}
      <span
        className={`absolute inset-y-0 left-0 w-0.5 ${solved ? 'bg-success-border' : 'bg-warning-border'}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug text-fg transition-colors group-hover:text-accent-border">
          {query.title || 'Untitled query'}
        </h3>
        <Badge variant="accent" className="shrink-0">
          {query.points}
        </Badge>
      </div>

      <p className="text-sm leading-relaxed text-fg-muted">{truncateWords(query.problemStatement, 22)}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="neutral">{TAG_LABEL[query.tag] ?? query.tag}</Badge>
        <Badge variant={solved ? 'success' : 'warning'}>
          {solved ? <IoCheckmarkCircleOutline aria-hidden="true" /> : <IoTimeOutline aria-hidden="true" />}
          {solved ? 'Solved' : 'Open'}
        </Badge>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border-subtle pt-3 text-xs text-fg-subtle">
        <Avatar src={author?.picture} name={author?.username ?? '?'} size="xs" />
        <span className="truncate">{author?.username ?? 'Unknown'}</span>
        {solved && solver && (
          <>
            <span aria-hidden="true">→</span>
            <Avatar src={solver.picture} name={solver.username ?? '?'} size="xs" />
            <span className="truncate text-success-border">{solver.username}</span>
          </>
        )}
      </div>
    </Card>
  );
}
