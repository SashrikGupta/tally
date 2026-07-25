# Conventions

## Folder & naming

- `PascalCase.jsx` for components, `camelCase.js` for everything else.
- One component per file; the file name matches the default export.
- Feature folders are self-contained: `features/contests/ContestList.jsx`,
  `ContestDetail.jsx`, etc. A feature never imports from another feature — shared
  logic moves to `components/`, `lib/`, or `hooks/`.
- No abbreviated or typo'd folder names. (The previous tree had
  `comoponent_code/`, `componenet_sync/`, `NON_HTML/` — do not reintroduce anything
  like this.)

## Data fetching

All fetching goes through `lib/api.js`. No component calls `fetch` directly and no
component builds a URL string.

```js
// lib/api.js
export const api = {
  contests: {
    list: () => request('/contest/getContest'),
    get: (id) => request(`/contest/${id}`),
  },
  problems: {
    run: (language, body) => request(`/run/${language}`, { baseUrl: COMPILE_URL, method: 'POST', body }),
  },
  // ...
};
```

Every screen that loads data uses `useAsync` and handles all four states —
loading / error / empty / success. See `01-architecture.md` for the canonical shape.
A screen that only renders the success case is not done.

## Error handling

- Never `console.error` and silently stop. A failed fetch either surfaces an
  `ErrorState` with a working retry, or a `Toast` for a failed action (submit, post,
  follow, etc.).
- `lib/api.js` throws a typed `ApiError { status, message }` on any non-2xx or
  `status: "FAILED"` response. Catch that type specifically where you need to branch
  on status code (e.g. treat 404 as empty on `plist`, per `03-api-surface.md`).

## Styling

- Tailwind utilities only, composed with `clsx`/`tailwind-merge` via the `cn()`
  helper in `lib/cn.js`. No inline `style={{}}` except for values that are
  fundamentally dynamic and numeric (draggable split-pane widths, computed chart
  colours) — never for anything a Tailwind class or CSS token could express.
- No dynamic class-name interpolation (`` `p-${x}` ``, `` `bg-[${color}]` ``) — see
  `05-design-system.md` §"The class-interpolation rule". Use a lookup table.
- No Bootstrap. It is fully removed — no `btn btn-*`, no `data-bs-*`, no Bootstrap CDN
  tags in `index.html`.
- Colour, spacing, radius, and shadow values come from tokens (`05-design-system.md`),
  never hardcoded hex or magic pixel numbers.

## State & context

- `AuthContext` — current user, login/logout, the Auth0 wrapper.
- `SettingsContext` — theme, editor preferences, keybindings; persisted to
  `localStorage` under one versioned key (`codeconnect:settings:v1`) with a migration
  path for future versions.
- `ToastContext` — the toast queue.
- Context providers are composed once in `app/providers.jsx`, ordered by dependency
  (Toast → Auth → Settings, since Auth and Settings may want to toast on error).

## Real-time code (playground)

- Socket event names live in one shared constants object mirrored between client and
  `socket_service` (`ACTIONS` in both `lib/socket.js` and the server).
- Remote-originated editor changes are applied with a transaction annotation so the
  local `onChange` handler can distinguish "the user typed this" from "a peer sent
  this" and avoid re-broadcasting an echo.
- Socket refs are read through a ref-callback or a state-backed ref, never a bare
  `useRef` whose `.current` is depended on directly in a `useEffect` dependency array —
  React does not re-run effects when a ref's `.current` changes, so that pattern
  silently never fires again after the first render.

## Forms

- Every submit button disables itself while the request is in flight and shows a
  loading state — no double-submit.
- Validate before sending; surface field-level errors inline, not just a toast.
- Multi-step forms (contest creation) show a summary/review step before the final
  submit, including anything (like test cases) added along the way.

## Git & secrets

- Nothing under `.env` or `config.env` is ever committed. Every service ships a
  `.env.example` listing the required keys with placeholder values.
- If you must hardcode a value for local testing, it goes in your own `.env`, never
  in a tracked file.

## Known project-specific gotchas

See `02-data-model.md` for the `problem.tag`/`problem.difficulty` swap and the
query-tag typos that must not be "fixed" without a migration — they're documented
there because they're data-shape issues, not code style.
