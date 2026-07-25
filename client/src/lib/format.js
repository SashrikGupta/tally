import { format, formatDistanceToNow, intervalToDuration } from 'date-fns';

/** 'YYYY-MM-DD' — the exact shape stored in user.activity[].date. */
export function toActivityDate(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

export function formatDate(value, pattern = 'MMM d, yyyy') {
  if (!value) return '—';
  try {
    return format(new Date(value), pattern);
  } catch {
    return '—';
  }
}

export function formatDateTime(value) {
  return formatDate(value, 'MMM d, yyyy · h:mm a');
}

export function formatRelative(value) {
  if (!value) return '—';
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return '—';
  }
}

/** Human duration between two dates/timestamps, e.g. "1h 30m". */
export function formatDuration(start, end) {
  if (!start || !end) return '—';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '—';

  const { days, hours, minutes } = intervalToDuration({
    start: startDate < endDate ? startDate : endDate,
    end: startDate < endDate ? endDate : startDate,
  });

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(' ');
}

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0';
  return Number(value).toLocaleString();
}

export function truncateWords(text, wordCount = 8) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return `${words.slice(0, wordCount).join(' ')}…`;
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
