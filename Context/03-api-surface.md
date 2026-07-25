# API Surface

Four services. Every response from `central_service` is wrapped:

```jsonc
// success
{ "status": "SUCCESS", "data": { /* payload */ } }
// failure
{ "status": "FAILED",  "message": "..." }
```

The client's `lib/api.js` unwraps `data` and throws an `ApiError` on `FAILED` or a
non-2xx status, so screens never see this envelope.

---

## central_service — `http://localhost:1934`

### Users

| Method | Path | Body / Params | Returns |
| --- | --- | --- | --- |
| `POST` | `/user` | full user document | `{ user: <id> }` |
| `POST` | `/user/sync` | `{ email, name?, picture? }` | `{ user, created }` |
| `POST` | `/user/update` | `{ id, nickname?, description?, year? }` | `{ user }` |
| `POST` | `/getuser` | `{ id }` | `{ user }` |
| `POST` | `/checkuser` | `{ email }` | `{ exists, userId }` |
| `POST` | `/follow` | `{ f1: actorId, f2: targetId }` | `{ following, followerCount }` |
| `POST` | `/rank` | `{ id }` | `{ rank }` — 1-based global rank |
| `GET` | `/user/:id/activity` | — | `{ activity[], stats }` |
| `POST` | `/userquerylist` | `{ id }` | `{ totalQueries, totalAskedQueries, totalSolvedQueries, queries[], tagCounts }` |
| `GET` | `/users/all` | — | `{ users[] }` sorted by points desc |
| `POST` | `/mail` | `{ mailId, subject, message }` | plain-text confirmation |

**`POST /user/sync` is the sign-in path.** It is the only endpoint the client
calls to establish identity: give it the email from Auth0 and it returns the
matching account, creating one on first sight. Idempotent and case-insensitive,
so it is safe to call on every page load.

It replaced a client-side check-email-then-create sequence that had two faults:
two interleaved calls could create duplicate accounts for one email, and every
new user got a random four-character suffix on their username whether or not
the plain one was taken. Both are now handled server-side — the username is
suffixed only on an actual collision, and a `11000` on email adopts the account
the racing request just created.

`GET /user/:id/activity` returns the day-by-day array plus derived
`{ currentStreak, longestStreak, totalActiveDays, totalActivity, bestDay,
bestDayValue, last30, activeToday }`. Streaks are computed server-side so every
surface that shows one agrees; a streak survives a one-day gap, because counting
only *today* would flip everyone to zero at midnight before they could act on it.
Split out from `getuser` so the other screens that load a user stop paying for a
365-entry array they never render.

`GET /contest/your/stats/:userId` now also returns `totals` (problem count per
difficulty) and `solvedTotal`. Without per-difficulty totals the profile could
only show solves against an undifferentiated grand total. The same pass fixed two
faults in it: repeat accepted submissions for one problem were each counted, and
a solve whose problem had since been deleted threw a 500 on `.tag` of `null`.

`POST /follow` **toggles**. It used to only ever add, so a mis-click could not be
undone and the UI had to permanently disable the button once pressed.

`POST /user/update` accepts only `nickname`, `description` and `year`. Everything
else on the document — points, rating, username, the follow arrays — is derived
from activity and is deliberately not settable from the request body.

`POST /checkuser` is superseded by `/user/sync` and kept only because it is a
harmless read. Its response shape was fixed: it used to signal "email exists"
with `status: 'FAILED'`, inverting the meaning of the envelope. New code should
not use it.

### Queries

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/query/post` | `{ author, problemStatement, code, points, tag, title, status }` | echo of the input |
| `GET` | `/query/getall` | — | `{ users: query[] }` sorted by points desc |
| `POST` | `/query/getone` | `{ id }` | `{ users: query }` |
| `POST` | `/query/solve` | `{ qid, uid, sol, io }` | `{ message }` |

⚠️ Both getters return the payload under the key **`users`** regardless of type.
`lib/api.js` normalizes this.

`POST /query/post` fails with 500 if the stake exceeds the author's balance.

`POST /query/solve` runs the whole economy transaction: marks solved, credits the
author `points/2`, credits the solver `points × 2`, and bumps both heatmaps.

### Contests & problems

| Method | Path | Body / Params | Returns |
| --- | --- | --- | --- |
| `POST` | `/contest/addProblem` | problem fields | `{ problem: <id> }` |
| `POST` | `/contest/addContest` | `{ problems[], author, start, end, name }` | `{ contest }` |
| `GET` | `/contest/getContest` | — | `{ contests[] }` each with a derived `message` |
| `GET` | `/contest/:contestId` | — | `{ contest }` populated + `message` |
| `GET` | `/contest/problem/:id` | — | `{ problem }` |
| `GET` | `/contest/run/getall` | — | `{ problems[] }` — the Arena library |
| `POST` | `/contest/createResult` | `{ contest, user }` | `{ result }` — registers a participant |
| `POST` | `/contest/check` | `{ userId, problemId, code, solved }` | `{ code }` — upsert + award points |
| `POST` | `/contest/addpoint` | `{ contestId, userId, pointsToAdd }` | `{ result }` |
| `GET` | `/contest/rank/:contestId` | — | sorted participant array |
| `GET` | `/contest/your/plist/:userId` | — | `{ codes[] }` solved, problem populated |
| `GET` | `/contest/your/stats/:userId` | — | `{ total, solved: { Easy, Medium, Hard } }` |

**Route-order caveat:** `GET /contest/:contestId` is registered before
`/contest/problem/:id` and `/contest/run/getall`, but Express matches in declaration
order and those literal paths are declared later — they still resolve because
`:contestId` is matched first and would 500 on a cast error. Any *new* literal
`/contest/...` route must be declared **above** `/:contestId`.

`GET /contest/your/plist/:userId` returns **404** when the user has solved nothing.
Treat 404 as an empty list here, not an error.

`POST /contest/check` awards points only on the `false → true` transition of `solve`.

`GET /contest/rank/:contestId` response shape:

```jsonc
{ "status": "SUCCESS", "data": [
  { "name": "alice", "userPoints": 640, "resultPoints": 150, "rank": 1,
    "problemStatuses": [ { "problemId": "...", "solved": true } ] }
] }
```

---

## compilation_service — `http://localhost:2982`

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/run/python` | `{ code, input }` | see below |
| `POST` | `/run/cpp` | `{ code, input }` | " |
| `POST` | `/run/java` | `{ code, input }` | " |
| `GET` | `/health` | — | `{ ok: true }` |

```jsonc
{
  "output":  "stdout text",        // present on success
  "error":   "stderr or compile error",  // present on failure
  "timedOut": false,
  "exitCode": 0,
  "metrics": { "timeMs": 42, "memoryMb": 12.4 }
}
```

- Wall-clock limit **5 s**, then `SIGKILL` and `timedOut: true`.
- Max payload **256 KB**.
- Java sources must declare `public class Main`.
- The legacy routes `/py_router/`, `/CPP_router/`, `/JAVA_router/` are kept as aliases.

⚠️ This service runs **unsandboxed** user code as the server process user. It is safe
only on a trusted local machine. See `07-known-issues.md`.

---

## socket_service — `ws://localhost:2981`

Client → server:

| Event | Payload |
| --- | --- |
| `join` | `{ roomId, username }` |
| `code-change` | `{ roomId, code }` |
| `sync-code` | `{ socketId, code }` — replay buffer to one peer |
| `chat` | `{ roomId, text, username }` |
| `leave` | `{ roomId }` |

Server → client:

| Event | Payload |
| --- | --- |
| `joined` | `{ clients: [{ socketId, username }], username, socketId }` |
| `disconnected` | `{ socketId, username }` |
| `code-change` | `{ code }` |
| `chat` | `{ text, username, at }` |

`socketId` is camelCase on **every** event. (The old server emitted lowercase
`socketid` on `joined` and camelCase on `disconnected`, so client-side filtering
silently failed.)

---

## chat_service — `http://localhost:2983`

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| `GET` | `/health` | — | `{ ok, model, contextChars }` |
| `POST` | `/chat` | `{ message, history[] }` | `{ answer }` |
| `POST` | `/chat/stream` | same | `text/event-stream` of tokens |

`history` is `[{ role: "user" | "assistant", content: string }]`, most recent last,
trimmed server-side to the last 10 turns.

Streaming frames:

```
data: {"delta": "Contests are "}
data: {"delta": "timed events..."}
data: {"done": true}
```

Returns **503** with a readable `message` when Groq is unreachable or `GROQ_API_KEY`
is unset. The client renders that as an error bubble with a retry button.
