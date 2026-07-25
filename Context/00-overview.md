# CodeConnect — Overview

CodeConnect is a competitive-programming and peer-help platform. Developers solve
problems, compete in timed contests, ask and answer coding questions for points,
and pair-program together in realtime collaborative rooms.

The product has five pillars:

| Pillar | Route | What it does |
| --- | --- | --- |
| **Arena** | `/problems` | A permanent practice library of problems, filterable by difficulty and tag |
| **Battle** | `/contests` | Timed contests with a live leaderboard |
| **Queries** | `/queries` | Ask a coding question backed by your own points; another user solves it and earns them |
| **Playground** | `/playground` | Realtime collaborative editor rooms with chat and a shared runner |
| **Profile** | `/u/:id` | Stats dashboard: rank, points, contribution heatmap, solved breakdown |

## The points economy

Points are the platform's currency and the basis of ranking.

- Every user starts with **500 points**.
- Solving a problem awards that problem's point value.
- Asking a query **costs** you the points you stake on it. You cannot stake more than you hold.
- When someone solves your query, you get back **half** your stake (as a thank-you), and the solver earns **double** the stake.
- Every point-earning action adds **10** to your contribution heatmap for that day.
- Your global rank is your position when all users are sorted by points, ties broken by who joined earlier.

## Architecture at a glance

Four independent services, deliberately split so the risky part (running untrusted
code) is isolated from the data:

```
                        ┌──────────────────────────┐
                        │   client  (React/Vite)   │
                        │        :5173             │
                        └────┬────┬────┬────┬──────┘
                             │    │    │    │
        ┌────────────────────┘    │    │    └────────────────────┐
        │            ┌────────────┘    └───────────┐             │
        ▼            ▼                             ▼             ▼
┌────────────────┐ ┌────────────────┐ ┌──────────────────┐ ┌──────────────┐
│ central_service│ │ compilation_   │ │  socket_service  │ │  ml_service  │
│     :1934      │ │ service :2982  │ │      :2981       │ │    :2983     │
│ Express+Mongo  │ │ Express+spawn  │ │ Express+socket.io│ │ Flask+PyTorch│
│                │ │                │ │                  │ │              │
│ users problems │ │ runs Py/C++/   │ │ collab rooms,    │ │ in-app       │
│ contests       │ │ Java in child  │ │ code sync, chat  │ │ assistant    │
│ queries codes  │ │ processes      │ │                  │ │              │
│ results mail   │ │                │ │                  │ │              │
└───────┬────────┘ └────────────────┘ └──────────────────┘ └──────────────┘
        │
        ▼
     MongoDB
```

### Why four services

- **central_service** owns all persistent state. It is the only service that talks to MongoDB.
- **compilation_service** executes untrusted user code. It is stateless and holds no
  credentials, so a compromise there cannot reach the database.
- **socket_service** holds only ephemeral in-memory room state. It can be restarted or
  scaled independently of everything else.
- **ml_service** is the in-app assistant. It is Python because the bundled intent
  classifier is PyTorch, and it is isolated so a slow or failed model load cannot
  affect the rest of the app. Its model loads lazily on the first message — see
  `01-architecture.md`.

### Ports

| Service | Port | Env var |
| --- | --- | --- |
| client (dev) | 5173 | — |
| central_service | 1934 | `PORT` |
| socket_service | 2981 | `PORT` |
| compilation_service | 2982 | `PORT` |
| ml_service | 2983 | `PORT` |

The client reads all four base URLs from `VITE_*` variables — see `client/.env.example`.

## Tech stack

**Client** — React 18, Vite 5, React Router 6, Tailwind CSS 3, CodeMirror 6,
Chart.js 4, socket.io-client, Auth0.

**central_service** — Node, Express 4, Mongoose 8, Nodemailer.

**compilation_service** — Node, Express 4, `child_process.spawn` against the host's
`python`, `g++`, and `javac`/`java` toolchains.

**socket_service** — Node, Express 4, socket.io 4.

**ml_service** — Python 3.11+, Flask, flask-cors, PyTorch, NLTK.

## Running it locally

Copy every `.env.example` to `.env` first — nothing starts without that. You also
need MongoDB running, plus `python`, `g++` and `javac` on `PATH` for the
compilation service to handle all three languages.

### All at once

```bash
python dev.py            # starts everything; Ctrl-C stops everything
python dev.py --install  # npm install anything missing first
python dev.py --list     # show the service table
python dev.py --only client central
python dev.py --reset-db  # wipe the database first, then start clean
```

`--reset-db` drops every CodeConnect collection before starting and asks to
confirm (`--yes` skips the prompt). It delegates to
`services/central_service/scripts/reset-db.js`, which lives next to the models so
the list of owned collections cannot drift from them — it drops only those six,
never the whole database, and refuses outright to touch `test`, `admin`, `local`
or `config`. The same script is available on its own as `npm run reset-db`.

After a reset your browser still holds the deleted account in `localStorage`;
reloading recreates it, because `POST /user/sync` is keyed on the Auth0 email.

`dev.py` starts each service in its own process group and tears it down as a
process tree on exit. That detail is load-bearing on Windows: `npm` is a batch
shim that spawns the real node process as a *child*, so terminating just the
process you launched leaves a server holding its port. It also refuses to start a
service whose port is already taken — checking both IP stacks, because Vite binds
`::1` only and would otherwise quietly move to 5174, which is not in the services'
CORS allowlist.

Output is streamed to the console with a per-service prefix and written to
`logs/<service>.log` plus a combined `logs/all.log`. The directory is cleared on
each run (`--keep-logs` to append instead).

### One service at a time

```bash
cd services/central_service     && npm install && npm start   # :1934, needs Mongo
cd services/compilation_service && npm install && npm start   # :2982
cd services/socket_service     && npm install && npm start   # :2981
cd services/ml_service && pip install -r requirements.txt && python app.py  # :2983
cd client && npm install && npm run dev                     # :5173
```
