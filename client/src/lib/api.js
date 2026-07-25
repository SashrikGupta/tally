// Single point of contact with every backend service. No other module in the
// client calls fetch() or builds a URL — see Context/06-conventions.md.

const CENTRAL_URL = import.meta.env.VITE_CENTRAL_API_URL || 'http://localhost:1934';
const COMPILE_URL = import.meta.env.VITE_COMPILE_API_URL || 'http://localhost:2982';
const CHAT_URL = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:2983';

export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.cause = cause;
  }
}

async function request(path, { baseUrl = CENTRAL_URL, method = 'GET', body, timeoutMs = 15000, signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort());

  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Is the service running?', { status: 0, cause: err });
    }
    throw new ApiError('Could not reach the server. Check your connection.', { status: 0, cause: err });
  }
  clearTimeout(timeout);

  let json = null;
  try {
    json = await res.json();
  } catch {
    // some endpoints (compile server on rare paths) may not return JSON
  }

  if (!res.ok || json?.status === 'FAILED') {
    const message = json?.message || `Request failed (${res.status})`;
    throw new ApiError(typeof message === 'string' ? message : JSON.stringify(message), { status: res.status });
  }

  return json;
}

// ---------------------------------------------------------------------------
// Users / auth
// ---------------------------------------------------------------------------

const users = {
  create: (payload) => request('/user', { method: 'POST', body: payload }).then((r) => r.data.user),

  get: (id) => request('/getuser', { method: 'POST', body: { id } }).then((r) => r.data.user),

  update: (id, patch) => request('/user/update', { method: 'POST', body: { id, ...patch } }).then((r) => r.data.user),

  /**
   * Exchange an authenticated identity for its app account, creating one on
   * first sign-in. Idempotent — safe to call on every page load.
   */
  sync: ({ email, name, picture }) =>
    request('/user/sync', { method: 'POST', body: { email, name, picture } }).then((r) => r.data),

  /** Toggles the follow edge; resolves to the resulting state. */
  toggleFollow: (followerId, followeeId) =>
    request('/follow', { method: 'POST', body: { f1: followerId, f2: followeeId } }).then((r) => r.data),

  rank: (id) => request('/rank', { method: 'POST', body: { id } }).then((r) => r.data.rank),

  /** Day-by-day activity plus server-computed streak stats. */
  activity: (id) => request(`/user/${id}/activity`).then((r) => r.data),

  queryStats: (id) => request('/userquerylist', { method: 'POST', body: { id } }).then((r) => r.data),

  listAllByPoints: () => request('/users/all').then((r) => r.data.users),

  sendMail: (mailId, subject, message) =>
    request('/mail', { method: 'POST', body: { mailId, subject, message } }),
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const queries = {
  post: (payload) => request('/query/post', { method: 'POST', body: payload }),

  list: () => request('/query/getall').then((r) => r.data.users ?? []),

  get: (id) => request('/query/getone', { method: 'POST', body: { id } }).then((r) => r.data.users),

  solve: (payload) => request('/query/solve', { method: 'POST', body: payload }),
};

// ---------------------------------------------------------------------------
// Contests & problems
// ---------------------------------------------------------------------------

const contests = {
  list: () => request('/contest/getContest').then((r) => r.data.contests),

  get: (id) => request(`/contest/${id}`).then((r) => r.data.contest),

  addProblem: (payload) => request('/contest/addProblem', { method: 'POST', body: payload }).then((r) => r.data),

  create: (payload) => request('/contest/addContest', { method: 'POST', body: payload }).then((r) => r.data.contest),

  register: (contestId, userId) =>
    request('/contest/createResult', { method: 'POST', body: { contest: contestId, user: userId } }).then((r) => r.data.result),

  checkSolution: (payload) => request('/contest/check', { method: 'POST', body: payload }).then((r) => r.data.code),

  addPoints: (contestId, userId, pointsToAdd) =>
    request('/contest/addpoint', { method: 'POST', body: { contestId, userId, pointsToAdd } }),

  rankings: (contestId) => request(`/contest/rank/${contestId}`).then((r) => r.data),
};

const problems = {
  get: (id) => request(`/contest/problem/${id}`).then((r) => r.data.problem),

  listAll: () => request('/contest/run/getall').then((r) => r.data.problems),

  solvedByUser: async (userId) => {
    try {
      const json = await request(`/contest/your/plist/${userId}`);
      return json.data.codes;
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  statsByUser: (userId) => request(`/contest/your/stats/${userId}`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Code execution
// ---------------------------------------------------------------------------

const LANGUAGE_ROUTE = { python: '/run/python', cpp: '/run/cpp', java: '/run/java' };

const runner = {
  run: (language, code, input) =>
    request(LANGUAGE_ROUTE[language] ?? LANGUAGE_ROUTE.python, {
      baseUrl: COMPILE_URL,
      method: 'POST',
      body: { code, input },
      timeoutMs: 12000,
    }),
};

// ---------------------------------------------------------------------------
// Chat assistant
// ---------------------------------------------------------------------------

const chat = {
  send: (message, history = []) =>
    request('/chat', { baseUrl: CHAT_URL, method: 'POST', body: { message, history }, timeoutMs: 30000 }).then(
      (r) => r.answer,
    ),

  /** Streams token deltas via a callback; returns the full text. */
  async stream(message, history, onDelta, { signal } = {}) {
    const res = await fetch(`${CHAT_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
      signal,
    });
    if (!res.ok || !res.body) {
      throw new ApiError('The assistant is unavailable right now.', { status: res.status });
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const payload = line.replace(/^data:\s*/, '');
        if (!payload) continue;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.delta) {
            full += parsed.delta;
            onDelta?.(parsed.delta, full);
          }
          if (parsed.error) {
            throw new ApiError(parsed.error, { status: 502 });
          }
        } catch (err) {
          if (err instanceof ApiError) throw err;
          /* ignore malformed frame */
        }
      }
    }
    return full;
  },
};

export const api = { users, queries, contests, problems, runner, chat };
export { CENTRAL_URL, COMPILE_URL, CHAT_URL };
