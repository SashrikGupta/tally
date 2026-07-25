# Architecture

## Client structure

Everything lives under `client/src/`. There are no source folders outside it.

```
client/src/
  main.jsx              Entry point — mounts <Providers><AppRouter/></Providers>
  app/
    router.jsx          Route table: PublicShell tree + RequireAuth/AppShell tree
    providers.jsx       Nested context providers, ordered by dependency
    RequireAuth.jsx     The access boundary (layout route) + SignInPrompt
    ErrorBoundary.jsx   Top-level crash net
    NotFound.jsx
    layout/
      AppShell.jsx      Backdrop + TitleBar + ActivityRail + <Outlet/> + StatusBar
      PublicShell.jsx   Chrome for the two anonymous-reachable pages
      Backdrop.jsx      Fixed wallpaper + aurora layers
      TitleBar.jsx      44px top chrome
      ActivityRail.jsx  52px left icon rail
      StatusBar.jsx     26px bottom bar
      CommandPalette.jsx  Ctrl+K
      Logo.jsx          Inline SVG mark, themed off the accent token
  components/
    ui/                 Design-system primitives. No feature logic. No data fetching.
    editor/             CodeEditor, EditorToolbar, OutputPanel, themeMap
    layout/             Panel, SplitPane, PageHeader, Section, FilterBar
    charts/             DoughnutChart, ContributionHeatmap, QueryBreakdownChart
  features/
    auth/       Landing (also the sign-in page)
    home/       Home — the signed-in launchpad
    problems/   ProblemList, ProblemSolve, ProblemForm
    contests/   ContestList, ContestDetail, ContestRankings, ContestCreate
    queries/    QueryList, QueryDetail, QueryPost, QueryCard
    playground/ PlaygroundEnter, PlaygroundRoom, RoomChat
    profile/    ProfileDashboard
    connect/    ConnectDirectory
    settings/   Settings + per-section panels
    chatbot/    ChatbotPanel
    misc/       About, Blog
  lib/          api.js socket.js cn.js format.js constants.js storage.js
  hooks/        useAsync useLocalStorage useDebounce useCodeRunner
                useCollaborativeEditor useKeyboardShortcut
  contexts/     AuthContext SettingsContext ToastContext
  styles/       tokens.css themes.css index.css
```

### Route topology

Two shells, one rule: **anything rendered inside `AppShell` is behind
`RequireAuth`.** Because the guard is a layout route rather than a per-route
wrapper, a newly added feature route is private by default and has to be moved
out of the subtree to become public.

```
PublicShell            RequireAuth ─▶ AppShell
  /                      /home  /problems  /contests  /queries
  /about                 /playground  /connect  /u/:id  /settings  /blog
```

### Layering rules

Imports flow strictly downward. A violation of this is a bug:

```
features/  →  components/  →  lib/  →  (nothing)
     ↓            ↓
   hooks/  ←──────┘
     ↓
  contexts/
```

- `components/ui/*` never imports from `features/` and never fetches data.
- `features/*` never imports from another feature. Shared code moves to `components/` or `lib/`.
- Only `lib/api.js` calls `fetch`. No component builds a URL itself.

## Data flow

Every screen that loads data uses the same shape:

```jsx
const { data, loading, error, refetch } = useAsync(() => api.contests.list(), []);

if (loading) return <TableSkeleton rows={8} />;
if (error)   return <ErrorState error={error} onRetry={refetch} />;
if (!data.length) return <EmptyState title="No contests yet" />;
return <ContestTable contests={data} />;
```

All four states are mandatory. A screen that only handles the success case is incomplete.

## Realtime (playground)

```
Browser A                socket_service               Browser B
    │                          │                         │
    │──── join {roomId, user} ─▶                         │
    │                          │──── joined {clients} ───▶
    │◀─── joined {clients} ────│                         │
    │                          │                         │
    │─ code-change {roomId,code}▶                        │
    │                          │─── code-change {code} ──▶
    │                          │                         │
    │◀───── sync-code ─────────│◀─ sync-code {socketId} ─│
```

`sync-code` is how a late joiner gets current buffer contents: on `joined`, existing
clients push their buffer to the new socket id.

Echo suppression matters. When a remote `code-change` arrives we apply it with an
annotation that marks the transaction as remote, and the local change handler ignores
annotated transactions. Without this, two clients bounce edits off each other forever.

## Code execution

```
ProblemSolve ──POST /run/{language}──▶ compilation_service
                                            │
                                            ├─ mkdtemp()  (unique per request)
                                            ├─ write source file
                                            ├─ compile (C++/Java) → spawn
                                            ├─ pipe stdin, capture stdout/stderr
                                            ├─ SIGKILL at 5s
                                            └─ rm -rf tempdir
                                            │
        ◀── { output, error, timedOut, metrics{timeMs, memoryMb} } ──┘
```

Each request gets its own temp directory. This is load-bearing: the previous
implementation wrote to fixed filenames in the server directory, so two concurrent
submissions overwrote each other's source and read each other's binaries.

Submitting a problem runs every test case, then reports the aggregate to
`POST /contest/check`, which awards points on the first successful solve.

## Chat assistant

```
ChatbotPanel ──POST /chat/stream {message, history}──▶ ml_service (Flask, :2983)
                                                            │
                                              chat.get_response(msg)
                                        (bag-of-words → NeuralNet → intents.json)
                                                            │
                            ◀──── text/event-stream of {delta} frames ─────┘
```

Routes: `POST /chat`, `POST /chat/stream`, `GET /health`, and `POST /predict` as a
legacy alias. The client only uses the first three.

The model is **loaded lazily** on the first message, not at import: pulling in torch
and reading `data.pth` takes seconds and hard-fails when the ML dependencies are
absent. Deferring it means the process still boots and answers `/health`, and a
missing model degrades to an explanatory reply instead of a crash at startup.

The classifier returns a whole canned response at once, so `/chat/stream` has nothing
genuinely incremental to send — it chunks the reply word by word anyway, because the
client's stream reader is the code path that renders progressively and it should be
the one that gets exercised.

> An earlier draft of this document described a LangChain + Groq service here. That
> was never built; the intent classifier is what actually ships. Until this pass the
> server also listened on Flask's default port 5000 and exposed only `/predict`, so
> the assistant panel could never reach it at all.
`context_loader.py` concatenates them at startup.

## Authentication (current state)

Auth0 handles login. On return, the client posts the Auth0 email to
`POST /checkuser`, receives the app's Mongo `userId`, and stores it in `localStorage`.

**This is not secure.** The `userId` is client-supplied on every subsequent request and
the API does not verify it. Anyone can act as anyone by editing `localStorage`. This is
documented in `07-known-issues.md` and requires a dedicated auth pass to fix properly.
