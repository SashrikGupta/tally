# Known Issues

Bug inventory from the pre-rewrite codebase, with disposition. "Fixed in rewrite"
means addressed by this restructure; "Out of scope" means flagged but not fixed here
and needs its own pass.

## Security — fix immediately, regardless of everything else

| Issue | Location | Status |
| --- | --- | --- |
| Gmail app password committed in plaintext | `services/central_service/app.js` | **Fixed** — moved to `.env` |
| MongoDB Atlas URI with credentials committed | `services/central_service/server.js` | **Fixed** — moved to `.env` |
| `client/config.env` tracked in git | client root | **Fixed** — gitignored, `.env.example` added |
| No auth verification — client-supplied `userId` trusted on every mutating route | all of `central_service` | **Out of scope** — needs a dedicated JWT/session pass across the whole API; see below |
| Compilation server executes untrusted code with no sandboxing | `compilation_service` | **Out of scope** — needs container-per-submission isolation; concurrency corruption is fixed, execution isolation is not |
| Bare `cors()` with no origin allowlist | `central_service`, `socket_service` | **Fixed** — restricted to known origins |

> The leaked credentials remain in git history even after removal from `HEAD`.
> **Rotate the Gmail app password and the MongoDB Atlas database user** — this repo
> change does not revoke them.

## Build & tooling

| Issue | Status |
| --- | --- |
| Tailwind loaded via CDN `<script>`, config `content` glob matched zero files | **Fixed** |
| Bootstrap CSS/JS loaded via CDN in `index.html`, fighting Tailwind | **Fixed** — removed |
| `tailwind.config.js` used `module.exports` in an ESM package | **Fixed** |
| Dynamic Tailwind class interpolation (`` p-${x} ``, `` bg-[${color}] ``) — silently produced no styling | **Fixed** — replaced with lookup tables everywhere |
| CDN-hotlinked `moment` import (`skypack.dev`) | **Fixed** — replaced with `date-fns` |
| Unused dependencies (`d3`, `styled-components`, `flowbite-react`, `dot`, `env`, `react-scripts`, server-side `socket.io` in the client) | **Fixed** — removed |
| Client/server port mismatch — client targeted `:5000`/`:3145`, servers defaulted to `2981`/`2982` | **Fixed** — fixed ports, driven by `.env` |

## Structural

| Issue | Status |
| --- | --- |
| ~600 duplicated lines across 4 near-identical IDE screens | **Fixed** — extracted `IDEWorkspaceLayout` + shared `CodeEditor` |
| ~150 duplicated lines between contest and standalone problem-authoring forms | **Fixed** — merged into one `ProblemForm` |
| Six top-level folders outside `src/`, two with typos (`comoponent_code`, `componenet_sync`) | **Fixed** — everything moved under `src/` |
| No loading/error/empty states on almost every screen | **Fixed** — `useAsync` + `Skeleton`/`ErrorState`/`EmptyState` mandated everywhere |
| Chatbot component built but never mounted anywhere in the JSX tree | **Fixed** — rebuilt and mounted globally |

## Functional bugs, by area

**Editor**
- CodeMirror 5 hardcoded to the Dracula theme regardless of app theme — **fixed**, editor theme is now a `SettingsContext` value.
- Server-loaded code silently dropped because CodeMirror replaced the controlling `<textarea>` before React's `value` reached it — **fixed** by moving to CodeMirror 6's controlled-value API.
- Editor re-instantiated (stacking instances) on every prop change in the old effect-based setup — **fixed**.
- Playground editor hardcoded `mode: 'python'`, ignoring the room's language selector — **fixed**.

**Playground / realtime**
- Hooks-after-early-return: `if (!location.state) return <Navigate/>` sat before `useEffect` calls, crashing React on direct navigation to a room URL — **fixed**, guard moved after all hooks.
- Chat messages mutated an array in place before `setState`, so React never detected the change and incoming messages didn't render — **fixed**.
- Remote `code-change` listener was registered in an effect keyed on `socketRef.current` (a ref field) — effects don't re-run on ref mutation, so the listener frequently never attached and remote edits silently never applied — **fixed**, socket lifecycle now goes through a ref-callback pattern documented in `06-conventions.md`.
- `alert()` used for join/leave notifications — **fixed**, replaced with toasts.
- Room seeded with two fake hardcoded users on mount — **fixed**, removed.
- Saved solution sent `sol: ed.getValue` (the function reference, not its result) — every saved solution serialized as `undefined` — **fixed**.

**Problem solving**
- Custom-input textarea had a `value` prop with no `onChange`, making it permanently read-only, while the run handler read its content via `getElementById` — a real bug, not just a display issue: users could never test their own input — **fixed**, editor state is now fully controlled.
- Run/submit implemented as `useEffect`s keyed on a toggle boolean, which also fired once on mount — sent an empty program to the compiler on every page load — **fixed**, these are now plain event handlers.
- Query-solve screen (`QDL`) always compiled against the Python endpoint regardless of the selected language — **fixed**.
- Output written via direct DOM mutation (`getElementById('out2').value = ...`) alongside a React-controlled sibling element — **fixed**, output is now a normal React-rendered panel.
- The solve confirmation modal was defined as a component *inside* the parent render body, remounting (and losing any internal state) on every parent render — **fixed**, extracted to its own module.

**Contests**
- Contest creation's submit handler read `questions` state before the preceding `set_questions` call had applied, so the last question added was silently dropped from every contest — **fixed** by restructuring the form to build the full payload in one step rather than relying on stale closure state.
- `difficulty` field populated with the point value instead of an Easy/Medium/Hard label (the label instead lives in `tag`) — **documented as a data-shape convention in `02-data-model.md`**, not "fixed" since existing data depends on it; new code reads difficulty from `tag`.
- Contest duration rendered via naive hour-division producing values like `1.5:00` instead of a real duration format — **fixed**.
- Rankings table: missing `key` props on every mapped row/cell, a `<th>` used inside `<tbody>`, and a `console.log` inside the render map (O(users × problems) log lines per render) — **fixed**.

**Queries**
- Query list's seven "sort by" buttons had zero `onClick` handlers — pure decoration — **fixed**, wired to real sort/filter state.
- Three buttons shared `id="process"`, two shared `id="solved"` — **fixed**, ids removed in favor of React state/keys entirely (DOM ids should not drive app logic).
- `query.problemStatment` (missing the `e`) was read instead of the actual field `problemStatement`, so descriptions rendered blank — **fixed**.

**Profile**
- TDZ crash: `navigate('/login')` was called before `const navigate = useNavigate()` was declared later in the same component, throwing `ReferenceError` whenever the route param was falsy — **fixed**.
- Navigation triggered during render instead of inside an effect — **fixed**.
- Page first rendered hardcoded placeholder identity data (`"Sashrik"`, `post: 30`, a random Unsplash avatar URL) that real data never overwrote for several fields — **fixed**, placeholders removed in favor of proper loading skeletons.
- A `<style>` tag was rendered inside each of the 366 contribution-heatmap cells, interpolating a JS object directly into CSS text (rendering literal `[object Object]`) — **fixed**, hover styling moved to a single stylesheet rule.
- `data.data.user.activity.map(...)` crashed for any user with no activity history — **fixed**, guarded with a default empty array.
- "Query solved" vs "query asked" values were swapped against their labels in two separate places (`QBC.jsx` and the computation feeding it in the profile page) — **fixed**.
- A global `label {}` CSS rule in a component-scoped-looking module leaked 20px bold styling to every `<label>` in the app — **fixed**, removed.
- The doughnut chart component was imported under a misleading alias (`RadarChart`) and received a `qt` prop it silently ignored, while the calculation feeding that prop was itself dead code — **fixed**, both the misnomer and the dead computation removed.

**Connect**
- A specific user's Mongo ObjectId was hardcoded and excluded from the directory listing — **fixed**, removed.

**Chatbot**
- Old PyTorch/NLTK intent-classifier bot (`chat.py`, `model.py`, `nltk_utils.py`, `train.py`, `intents.json`, `data.pth`) — **replaced** with a LangChain + Groq (`ChatGroq`, `openai/gpt-oss-120b`) service using the `Context/` files as its system prompt. No retrieval/embeddings layer — deliberately kept simple; current-generation LLMs handle a few thousand tokens of context directly.
- The old chatbot component existed but was never mounted in any route or layout — dead code end-to-end — **fixed**, now mounted globally as a docked panel.

**compilation_service**
- All three language handlers wrote to fixed filenames (`script.py`, `main.cpp`, `Main.java`, `a.out`) in the server's own directory, and a shared cleanup step deleted all of them after every run — two concurrent submissions corrupted each other's source and binaries — **fixed**, every request now gets its own temp directory.
- Timeout handling could leave `res.send` reachable on more than one code path for the same request — **fixed**.
- No payload size limit, no per-language resource limits, no concurrency cap — **fixed**, size cap and a concurrency limiter added; per-language sandboxing remains out of scope (see Security table above).

**socket_service**
- `new Server(server)` constructed with no CORS configuration, rejecting any cross-origin client — **fixed**.
- `JOINED` emitted `socketid` (lowercase); `DISCONNECTED` emitted `socketId` (camelCase) — the client's filtering logic used `socketId` in both places and silently failed on the first — **fixed**, standardized to `socketId` everywhere.
- A ladder of numbered debug `console.log` statements (`"ok1"` … `"ok7"`) — **fixed**, removed in favor of structured logging.
- `socket.leave()` called with no room argument in the `disconnecting` handler — **fixed**.

**central_service routing**
- `router.route('/userlist').get()` registered a route with **no handler function** — **fixed**, removed (unused) rather than filled in with a guess at intended behavior.
- `query_router.js` exported its router object twice (`module.exports` appeared twice in the same file) — **fixed**, harmless but removed.
- Every response used `res.send`/`res.status(200)` regardless of actual outcome in several spots — **fixed**, consistent status codes and the `{status, data|message}` envelope enforced everywhere.

## Query tag spelling — intentionally not "fixed"

`competetive` and `acedemic` are misspelled in stored data and read literally by the
stats aggregation. Correcting the spelling in code without a data migration would
silently break tag-counting for every existing document. See `02-data-model.md` for
the full list and the display-vs-storage handling.

## Fixed in the auth + appearance pass

**Access management**
- Every screen was reachable anonymously; `RequireAuth` was applied per-route, so a
  new route was public until someone remembered to wrap it — **fixed**, it is now a
  layout route and the whole `AppShell` subtree is private by construction. The public
  tree is exactly `/` (landing) and `/about`.
- There was no About page and no explanation of what the product was — **added**.

**Sign-in**
- Local `Login.jsx` / `Signup.jsx` screens existed alongside Auth0 — **deleted**. There
  is now no password field anywhere in the client.
- Sign-in is one click: `loginWithRedirect({ connection: 'google-oauth2' })` goes
  straight to Google, skipping Auth0's own account picker. GitHub is offered too.
- The Auth0 session lived in memory, so a refresh or a new tab logged the user out —
  **fixed** with `cacheLocation="localstorage"` + `useRefreshTokens`.
- The account was mirrored to `localStorage` so a reload paints the signed-in shell
  instead of flashing the landing page while Auth0 rehydrates. `logout()` clears it.
- The account-sync effect listed `userId` in its own dependency array while also
  setting it — every resolution re-ran the effect. **Fixed** with a `syncedFor` ref
  keyed on email, so sync runs once per authenticated session.
- Auth0 always returns to the origin, so sign-in dropped the user on the landing page
  regardless of where they clicked from. The intended destination now bridges the
  redirect through `sessionStorage` (`setReturnTo`/`takeReturnTo`) — it cannot ride on
  the URL, because the router's initial location is captured before Auth0's
  `onRedirectCallback` runs.

**Profile**
- `ProfileSection` re-fetched the user it was already given by `AuthContext`, so the
  form could render blank inputs and clobber in-progress edits when the response
  landed — **fixed**, it edits from the resolved account and pushes the saved result
  back with `patchAccount`.
- Follow was write-only and the button disabled itself permanently — **fixed**, the
  endpoint toggles and the UI is optimistic with rollback on failure.
- The user schema had no `picture`, so avatars everywhere fell back to initials even
  though the identity provider supplies one — **added**, refreshed on each sync.
- `email` had a `trin: true` typo instead of `trim`, and no `lowercase` — **fixed**;
  the same address in different case no longer makes a second account.

**Data**
- `DATABASE` had no database name in the connection string, so every collection landed
  in Mongo's shared default `test` database alongside unrelated projects on the same
  machine — **fixed**, it points at `codeconnect`, and `server.js` now refuses to start
  on a URI without a database path rather than silently co-mingling again.
- The garbage left by earlier manual testing (a `Temporary User` document carrying a
  plaintext `password` field from a schema that no longer exists) was dropped along
  with the other five CodeConnect collections in `test`.

**Chat service**
- `ml_service` exposed only `POST /predict` on Flask's default port 5000, while the
  client called `/chat` and `/chat/stream` on 2983 — the assistant could never have
  worked. **Fixed**: the service now serves the routes and port the client expects,
  loads the torch model lazily so a missing dependency degrades to a message instead
  of a boot crash, and chunks its reply over SSE so the client's streaming path is the
  one actually exercised.

**Appearance**
- Themes were hardcoded hex per file, so translucency/blur/glow were impossible
  without editing all of them — **restructured** into RGB triples plus derived tokens.
  See `05-design-system.md`.
- `@tailwind` directives preceded `@import` in `index.css`, which PostCSS warns about
  and which is fragile — **fixed**, imports come first.
- Inter and JetBrains Mono were named in the tokens but never actually loaded, so the
  entire UI silently rendered in the system font stack — **fixed** in `index.html`.
- The client shipped as one 1.6 MB bundle — **split**; CodeMirror and Chart.js are
  their own chunks now.

## Fixed in the charts + layout pass

**IDE screen layout**
- The editor collapsed to a single line on every IDE screen. Each screen inlined
  `<EditorToolbar/>` + `<div className="h-[calc(100%-2.5rem)]">`, hardcoding the
  toolbar at 40px; once the form controls were restyled the toolbar grew, the
  percentage height resolved against `auto`, and CodeMirror fell back to sizing
  itself to its content — so an empty buffer was one line that only grew when you
  pressed Enter. **Fixed** by deleting the measurement: `EditorPane` is a flex
  column with `min-h-0` on the growing child, which gives a definite height at any
  toolbar size. Every `calc()` height in the feature screens is gone.
- Panels carried `m-2 h-[calc(100%-1rem)]`, keeping a margin and a height in sync
  by hand — **fixed**, the gutter is padding on a `Pane` wrapper and panels are a
  plain `h-full`.
- `RoomChat` used `h-full` inside a flex body that also held the participant
  strip, so it overflowed by the strip's height — **fixed**, `flex-1 min-h-0`.

**Charts**
- Every chart hardcoded GitHub-dark hex values, in an app with eighteen themes —
  **fixed**, see `05-design-system.md`.
- The activity heatmap had no month labels, no legend, no tooltip and no streak
  numbers — **replaced** by `StreakHeatmap`, backed by a real endpoint.

**Data recording**
- Three controllers each carried their own copy of the find-or-push block that
  maintains `user.activity` — **extracted** to `utils/activity.js`.
- Seven debug `console.log`s sat in hot controller paths, one of them dumping
  every solved-problem document on each profile load — **removed**.

## Out-of-scope items requiring their own effort

1. **Real authentication.** The API currently trusts a client-supplied `userId` with
   no verification on any mutating route. Fixing this means JWT or session middleware
   across every controller in `central_service` — a project on its own.
2. **Sandboxed code execution.** The concurrency-corruption bug is fixed, but
   submitted code still runs directly on the host. True isolation means a
   container-per-submission model (e.g. Docker/Firecracker), which is infrastructure
   work beyond a client + hardening pass.
3. **Automated tests.** There is no test suite. Verification for this rewrite was a
   manual pass plus live endpoint checks against a running stack; adding real test
   coverage is a separate initiative.
4. **Rewriting git history** to purge already-leaked credentials. The values are
   removed from `HEAD` and rotated at the provider; the commits themselves still
   contain the old values unless the user explicitly asks for history rewriting.
