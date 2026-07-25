# Agent Progress Log — CodeConnect Restructure

Tracks progress on the plan in `C:\Users\sashr\.claude\plans\this-was-a-very-iterative-rabbit.md`
("CodeConnect — Professional Restructure & UI Overhaul"). Read that file for the
full plan and rationale; this file is a status snapshot of what's actually been
done in the repo so a session can resume cleanly.

## Status: Phase 6b in progress (chat_service not yet built)

---

## ✅ Done

### Phase 0 — `Context/` docs
All 8 files written at the repo root: `00-overview.md`, `01-architecture.md`,
`02-data-model.md`, `03-api-surface.md`, `04-features.md`, `05-design-system.md`,
`06-conventions.md`, `07-known-issues.md`. `04-features.md` is written for end
users and doubles as the chat assistant's system-prompt source (Phase 6b).

### Phase 1 — Client foundation
- Old client structure deleted: `comoponent_code/`, `componenet_sync/`,
  `components_basic/`, `component_auth/`, `component_contest/`, old `contexts/`,
  `NON_HTML/`, `actions.js`, `socket.js`, old `src/App.jsx` etc., tracked
  `client/config.env`, stale `package-lock.json`.
- `client/package.json`, `vite.config.js`, `tailwind.config.js` (now ESM,
  content glob fixed to actually match `src/`), `postcss.config.js`,
  `index.html` (CDN Tailwind/Bootstrap scripts removed), `.eslintrc.cjs`,
  `.gitignore`, `.env.example` — all rewritten.
- Design tokens: `client/src/styles/tokens.css` + 9 theme files under
  `client/src/styles/themes/` (vscode-light/dark is base+override, dracula,
  one-dark, nord, tokyo-night, solarized-light, gruvbox-dark, github-dark,
  github-light) + `index.css` entrypoint.
- `client/src/lib/`: `cn.js`, `constants.js`, `format.js`, `storage.js`,
  `api.js` (single fetch wrapper for all 4 services), `socket.js`.
- `client/src/hooks/`: `useAsync`, `useLocalStorage`, `useDebounce`,
  `useKeyboardShortcut`, `useCollaborativeEditor`, `useCodeRunner`.
- `client/src/contexts/`: `ToastContext`, `SettingsContext` (versioned +
  migratable localStorage), `AuthContext` (Auth0 + app userId resolution).

### Phase 2 — UI primitives + app shell
- `client/src/components/ui/`: Button, Spinner, Card, Badge (+DifficultyBadge),
  Input/Textarea/Select, Skeleton (+TableSkeleton/CardGridSkeleton),
  EmptyState, ErrorState, Avatar, Dialog (focus trap), Tabs, Table (sortable),
  Tooltip, DropdownMenu, Toast/ToastViewport. Barrel export `index.js`.
- `client/src/components/layout/`: Panel, SplitPane (draggable, persisted
  ratio), PageHeader, Section.
- `client/src/app/layout/`: TitleBar (Ctrl+K trigger, avatar menu),
  ActivityRail, StatusBar, CommandPalette, AppShell.
- `client/src/app/`: `router.jsx`, `providers.jsx`, `RequireAuth.jsx`,
  `NotFound.jsx`, `ErrorBoundary.jsx`. `main.jsx` wired.

### Phase 3 — CodeMirror 6 editor
- `client/src/components/editor/`: `themeMap.js` (uiw theme packages),
  `CodeEditor.jsx` (fully controlled, settings-driven, vim/emacs keymap
  support), `EditorToolbar.jsx`, `OutputPanel.jsx` (tabbed input/output/
  tests/metrics — replaces old DOM-write pattern).
- `useCollaborativeEditor` hook: echo-suppression for realtime sync, takes a
  live socket **instance** (state) rather than a ref, to avoid the stale-ref-
  in-deps bug documented in `Context/07-known-issues.md`.

### Phase 4 — All feature screens
- **Auth/misc**: `features/auth/{Landing,Login,Signup}.jsx`,
  `features/misc/Blog.jsx`.
- **Problems**: `ProblemList.jsx`, `ProblemSolve.jsx` (SplitPane IDE layout,
  controlled custom-input fix, Dialog-based solved modal), `ProblemForm.jsx`
  (shared standalone/embedded authoring form).
- **Contests**: `ContestList.jsx`, `ContestDetail.jsx`, `ContestRankings.jsx`,
  `ContestCreate.jsx` (two-step wizard using `ProblemForm` embedded — fixes
  the stale-closure bug that used to drop the last problem added to every
  contest).
- **Queries**: `QueryList.jsx` + `QueryCard.jsx`, `QueryPost.jsx`,
  `QueryDetail.jsx` (confirm-before-solve Dialog, fixed `sol` payload bug).
- **Playground**: `PlaygroundEnter.jsx` (room create/join, uuid), `RoomChat.jsx`,
  `PlaygroundRoom.jsx` (all hooks called unconditionally — fixes the hooks-
  count crash on direct navigation; declarative `<Navigate>` instead of
  imperative `navigate()` during render).
- **Connect/Profile**: `ConnectDirectory.jsx`,
  `components/charts/{DoughnutChart,ContributionHeatmap,QueryBreakdownChart}.jsx`
  (Chart.js v4, no CDN moment import, fixed swapped query-stat labels),
  `features/profile/ProfileDashboard.jsx`.
- **Chatbot UI**: `features/chatbot/ChatbotPanel.jsx` — docked panel, streaming
  support via `api.chat.stream`, persisted open state, Ctrl+/ shortcut,
  error/retry. **Actually mounted** in `AppShell.jsx` (old app imported but
  never rendered its chatbot).

### Phase 5 — Settings
- `features/settings/Settings.jsx` + `sections/{Appearance,Editor,
  Keybindings,Playground,Profile,Account}Section.jsx`. All controls apply
  live via `SettingsContext`; JSON export/import; theme swatch picker.

### Phase 6a — Backend hardening (Node services)
- **central_service**: secrets moved out of source into `.env`
  (`.env.example` committed) — Gmail app password and the MongoDB Atlas URI
  are gone from `app.js`/`server.js`. Added `helmet`, `express-rate-limit`,
  origin-restricted CORS, `catchAsync` + central `errorHandler` middleware,
  404 handler. Fixed: `/userlist` route with no handler (removed), duplicate
  `module.exports` in `query_router.js`, added `/user/update` route +
  controller (there was previously no way to edit a profile). `query_controller`
  now populates `author`/`solver` usernames server-side (removes the old N+1
  per-row `getuser` fetch pattern) and fixes the `postQuery` insufficient-
  points case to return 400 instead of 500. `user_controller.getUserQuery`
  rewritten to use `.populate('queries')` instead of an N+1 loop.
- **compilation_service**: `runner.js` is new — every run now happens in its
  own `fs.mkdtemp`-created temp directory, deleted in a `finally` block. This
  is the fix for the concurrency-corruption bug (concurrent submissions used
  to overwrite each other's fixed-name source/binary files). Added a simple
  concurrency limiter (`MAX_CONCURRENT_RUNS`, 429 when exceeded), a 256KB
  body limit, `/health`. Removed committed `a.exe`/`Main.class`/dead
  `index.html`, pruned unused deps (`compilex`, `cros`, `dot`, `env`,
  `body-parser`).
- **socket_service**: `actions.js` added (mirrors the client's `ACTIONS`
  exactly). `index.js` rewritten: CORS now actually configured on the
  `socket.io` `Server`, `socketId` casing made consistent on every event
  (was mixed `socketid`/`socketId` between `JOINED` and `DISCONNECTED`),
  chat contract changed to `{text, username, at}`, debug `console.log("ok1")`
  ladder removed, `socket.leave()` no-arg bug removed. Dropped the unused
  `socket.io-client` server-side dependency.

---

## ⏳ Not yet done

1. **Phase 6b — `chat_service`** (in progress when interrupted). Plan:
   - Delete `services/ml_service/` entirely (`chat.py`, `model.py`,
     `nltk_utils.py`, `train.py`, `intents.json`, `data.pth`, `README.md`,
     `requirements.txt`, `__pycache__/` — the last of these was already
     removed). **Not deleted yet** — the rest of `ml_service/` still exists
     on disk as of this checkpoint.
   - Create `services/chat_service/`: `app.py` (FastAPI, CORS, `/health`,  <!-- not built; ml_service kept the PyTorch bot, on Flask -->
     `POST /chat`, `POST /chat/stream`), `chat.py` (`ChatGroq` from
     `langchain-groq`, model `openai/gpt-oss-120b`, env-configurable),
     `context_loader.py` (concatenates `Context/*.md` into the system
     prompt at startup — no RAG/embeddings, per the user's explicit
     instruction), `requirements.txt`, `.env.example`
     (`GROQ_API_KEY`, `PORT`, `MODEL_ID`).
   - The client side (`src/lib/api.js` `chat.send`/`chat.stream`,
     `ChatbotPanel.jsx`) is **already written** against this contract, so
     only the Python service itself remains.
2. **Verification pass** — nothing in the plan's Verification section has
   been run yet:
   - `npm install` + `npm run build` + `npm run lint` in `client/`.
   - Start all four services and confirm they boot (`.env` files need to be
     created from each `.env.example` first — none exist yet, since they're
     gitignored and were never populated with real values).
   - The manual click-through checklist in the plan (theme switching, editor
     settings, vim keymap, command palette, run/submit a problem, create a
     contest with one problem, two-browser playground sync, direct room-URL
     navigation, error/empty states, chatbot Q&A, profile with no activity,
     responsive check, keyboard/focus accessibility pass).
   - The concurrency check against `compilation_service` (5 parallel
     submissions).
   - The secrets grep (`git ls-files` / `grep -rn "mongodb+srv\|edka lhlw"`).

## Known follow-ups already flagged as out of scope (see `Context/07-known-issues.md`)

- Rotating the leaked Gmail app password and MongoDB Atlas credentials at the
  provider (removing them from `HEAD` does not revoke them).
- Sandboxing `compilation_service` (concurrency bug is fixed; execution is
  still unsandboxed on the host).
- Real authentication (mutating routes still trust a client-supplied
  `userId`).
- Automated tests (none exist; verification is manual).

## Where to resume

Pick up at **Phase 6b**: finish deleting `services/ml_service/`, then build
`services/chat_service/` per the outline above, then run the Verification pass.
