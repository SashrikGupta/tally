# Data Model

Six Mongoose collections in one MongoDB database. All have `timestamps: true`
(`createdAt` / `updatedAt`).

## `user`

The central document. Everything references it.

| Field | Type | Notes |
| --- | --- | --- |
| `username` | String | required, **unique**, trimmed |
| `email` | String | required, **unique** |
| `age` | Number | required |
| `nickname` | String | required |
| `rating` | Number | default `3` |
| `points` | Number | default `500` — the platform currency |
| `description` | String | required — bio |
| `year` | String | required — e.g. "2nd year" |
| `following` | `[ObjectId → user]` | users this user follows |
| `followed` | `[ObjectId → user]` | users following this user |
| `queries` | `[ObjectId → query]` | queries **asked or solved** by this user |
| `activity` | `[{ date: String, value: Number }]` | contribution heatmap; `date` is `YYYY-MM-DD` |

**Static method** — `user.getRank(userId)` returns 1-based global rank: the count of
users with more points, plus users with equal points who registered earlier, plus one.

⚠️ `activity.date` is a **String**, not a Date. Always format with `YYYY-MM-DD` before
comparing, or lookups silently miss.

⚠️ `queries` mixes asked and solved. To tell them apart you must load each query and
compare its `author` / `solver` against the user id — which is exactly what
`POST /userquerylist` does.

## `problem`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | required |
| `tag` | String | required — **this holds the difficulty**: `Easy` \| `Medium` \| `Hard` |
| `difficulty` | String | required — historically written with the *points value*; treat as legacy |
| `desc` | String | required — problem statement |
| `testcase_input` | `[String]` | default `[]` |
| `testcase_output` | `[String]` | default `[]`, index-aligned with inputs |
| `points` | Number | required, default `0` |

⚠️ **`tag` and `difficulty` are backwards from their names.** The authoring form writes
the Easy/Medium/Hard label into `tag` and the numeric point value into `difficulty`.
`GET /contest/your/stats/:userId` correctly buckets on `code.problem.tag`. Read
difficulty from **`tag`**; `difficulty` is unreliable legacy data.

`testcase_input[i]` pairs with `testcase_output[i]`. The first pair is treated as the
public sample; the rest are hidden.

## `contest`

| Field | Type | Notes |
| --- | --- | --- |
| `problems` | `[ObjectId → problem]` | required, ordered |
| `participants` | `[ObjectId → user]` | appended on registration |
| `author` | `ObjectId → user` | required |
| `start` | Date | required |
| `end` | Date | required |
| `name` | String | required |

Contest state is **derived, never stored** — computed per request against the clock:

| Condition | Server `message` | Meaning |
| --- | --- | --- |
| `now < start` | `secondary` | Upcoming |
| `start ≤ now ≤ end` | `success` | Live |
| `now > end` | `danger` | Ended |

Those strings are Bootstrap class-name leftovers. The client maps them to
`upcoming` / `live` / `ended` in `lib/constants.js` rather than putting them in a
`className`.

## `code`

One row per (user, problem) pair — a user's latest submission.

| Field | Type | Notes |
| --- | --- | --- |
| `problem` | `ObjectId → problem` | required |
| `user` | `ObjectId → user` | required |
| `code` | String | required — latest source |
| `solve` | Boolean | required — has this user ever solved it |

Upserted by `POST /contest/check`. Points are awarded **only on the transition**
`solve: false → true`, so re-submitting a solved problem cannot farm points.

## `result`

One row per (contest, user) pair — contest-scoped score, separate from global points.

| Field | Type | Notes |
| --- | --- | --- |
| `contest` | `ObjectId → contest` | required |
| `user` | `ObjectId → user` | required |
| `points` | Number | required, default `0` |

Created on contest registration (`POST /contest/createResult`), incremented by
`POST /contest/addpoint`.

## `query`

| Field | Type | Notes |
| --- | --- | --- |
| `author` | `ObjectId → user` | who asked |
| `solver` | `ObjectId → user` | who solved; a sentinel id while unsolved |
| `problemStatement` | String | required |
| `code` | String | starter code from the asker |
| `io` | String | solver's sample I/O |
| `status` | String | `unsolved` \| `solved` |
| `solution` | String | solver's code |
| `points` | Number | stake |
| `tag` | String | required — category |
| `title` | String | short summary |

⚠️ The field is `problemStatement`. Old client code read `query.problemStatment`
(missing the `e`), which is why descriptions rendered blank.

⚠️ `solver` is set to a hardcoded sentinel ObjectId on creation rather than left
`null`. Treat that id as "unsolved" — it is not a real user.

### Query tags

The stored values contain historical typos and are matched literally elsewhere in the
codebase (including the stats aggregation). **Do not "fix" the spellings without a
data migration:**

`others` · `machine learning` · `cyber security` · `web dev` · `competetive` · `acedemic`

The UI shows corrected display labels while storing the original values.

## Relationship map

```
                  ┌────────────┐
                  │    user    │
                  └─────┬──────┘
        ┌───────────────┼────────────────┬──────────────┐
        │               │                │              │
   following/       queries[]       participant     author of
    followed            │                │              │
   (self-ref)           ▼                ▼              ▼
                  ┌──────────┐    ┌──────────┐   ┌──────────┐
                  │  query   │    │ contest  │◀──│ contest  │
                  └──────────┘    └────┬─────┘   └──────────┘
                                       │ problems[]
                                       ▼
                                  ┌──────────┐
                                  │ problem  │
                                  └────┬─────┘
                                       │
                     ┌─────────────────┴──────────────┐
                     ▼                                ▼
               ┌──────────┐                    ┌──────────┐
               │   code   │ (user × problem)   │  result  │ (user × contest)
               └──────────┘                    └──────────┘
```

## Invariants worth knowing

1. `code` is unique per (user, problem) — enforced by lookup-then-upsert, not by an index.
2. `result` is unique per (contest, user) — same, enforced in `createResult`.
3. A user's `points` never goes negative: posting a query checks the stake against the balance first.
4. `activity` has at most one entry per date; the code searches before pushing.
5. Deleting a problem or contest leaves orphaned `code` / `result` rows — there are no cascades.
