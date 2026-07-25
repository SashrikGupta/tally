# Features — User Guide

> This file is the assistant's primary knowledge source. It is written for the person
> using CodeConnect, not for the person building it. Keep it in plain language.

## Getting started

Sign in from the login screen — CodeConnect uses Auth0, so you can use an existing
account or create one. On your first sign-in a CodeConnect profile is created for you
with a starting balance of **500 points**.

After signing in you land on your **Profile** dashboard. The icon rail down the left
side takes you everywhere:

| Icon | Where it goes |
| --- | --- |
| Arena | Practice problems |
| Battle | Contests |
| Queries | Ask and answer questions |
| Playground | Collaborative coding rooms |
| Connect | Browse other users |
| Profile | Your dashboard |
| Settings | Themes, editor, keybindings |

Press **Ctrl+K** (**Cmd+K** on Mac) anywhere to open the command palette — it jumps to
any page and switches themes without touching the mouse.

---

## Points

Points are CodeConnect's currency and the basis of your rank.

**You earn points by:**
- Solving a practice problem or contest problem — you get that problem's point value.
- Solving someone else's query — you get **double** what they staked.

**You spend points by:**
- Asking a query. You choose the stake; you cannot stake more than you have.

**You get points back when:**
- Someone solves your query — you're refunded **half** your stake.

Every point-earning action also adds a square to your contribution heatmap for that day.

Your **rank** is your position among all users sorted by points. Ties go to whoever
joined CodeConnect first.

---

## Arena — practice problems

The Arena is the permanent problem library. Nothing is timed and you can attempt
anything as often as you like.

The list shows each problem's name, difficulty, tag, point value, and whether you've
solved it. Filter by difficulty (Easy / Medium / Hard) or search by name.

### Solving a problem

The solve screen is split into three parts:

- **Left** — the problem statement, its difficulty and point value, and the sample input/output.
- **Right, top** — the code editor.
- **Right, bottom** — your custom input, the output, and test results.

Pick your language (Python, C++, or Java) from the toolbar.

**Run** compiles and executes your code against whatever is in the custom input box,
and shows you the output plus timing and memory. Use it to experiment — it does not
submit anything.

**Submit** runs your code against every hidden test case and reports how many passed.
If all of them pass, the problem is marked solved and the points are added to your
balance.

You only earn a problem's points **once**. Re-submitting a solved problem is fine —
it updates your saved code but doesn't award points again.

> **Java note:** your class must be named `Main` (`public class Main`), or compilation fails.

There's a 5-second time limit per run. Exceeding it shows "Time limit exceeded".

---

## Battle — contests

Contests are timed events containing a set of problems. Every contest is in one of
three states:

- **Upcoming** — starts later; you can see it but not enter.
- **Live** — you can register and solve.
- **Ended** — read-only; the final leaderboard stays available.

### Taking part

Open a live contest and press **Enter Contest** to register. That adds you to the
participant list and creates your scorecard starting at zero.

Inside, you get the problem list. Solving a contest problem works exactly like the
Arena, with one difference: points count **twice** — once toward your global balance,
and once toward your score in that contest.

**Global rankings** shows the live leaderboard: every participant, which problems
they've solved (✓ / ✗ per problem), and their contest score, sorted highest first.
A contest score is separate from your global points — winning a contest doesn't
overwrite your overall standing.

### Creating a contest

Anyone can create one. **Create Contest** runs a two-step flow:

1. **Details** — name, start time, end time.
2. **Problems** — add each problem with its name, difficulty, points, description,
   and test cases. Add as many test cases as you want; the first pair is shown to
   entrants as the sample and the rest stay hidden.

You can review everything before submitting.

---

## Queries — ask and answer

Queries are how you get unstuck when a problem isn't the issue — your code is.

### Asking

**Post Query** asks you for a title, a category, your problem description, your
current (broken) code, and a **point stake**.

The stake is what makes it work: it's deducted immediately, and it's what a solver
earns. A bigger stake gets attention faster. You can't stake more than you hold.

### Answering

The query list shows every open question — title, category, description, stake, and
status. Filter by category or status, or search.

Open one and you get the asker's code in an editor. Run it, find the bug, fix it, and
submit your solution. You earn **double** the stake; the asker gets half of theirs back
and the query is marked solved.

Both of you get an email so you can follow up, and you're pointed at a Playground room
if you want to pair on it live.

---

## Playground — collaborative rooms

The Playground is a shared editor. Everyone in a room sees the same buffer and edits
appear live as they're typed.

### Joining

Go to Playground and either paste a room ID someone gave you or generate a new one,
then enter a display name. Share the room ID to invite people.

### Inside a room

- **Editor** — shared by everyone. Your cursor is yours; edits sync instantly.
- **Chat** — sidebar, alongside the connected-user list.
- **Run** — executes the shared buffer with your input and shows the output. Running is local: you see the result, others don't unless you tell them.
- **Language** — Python, C++, or Java. Changing it changes syntax highlighting for you.

If you join a room that's already active, you receive the current buffer automatically.
Leaving is just closing the tab or navigating away; others see you disconnect.

Rooms are ephemeral. Nothing is saved when the last person leaves — copy anything you
want to keep.

---

## Connect

Connect lists every CodeConnect user sorted by points, with their rating and rank.
Open a profile to see their full dashboard, or follow them from there.

---

## Profile

Your dashboard collects everything about your activity:

- **Identity** — avatar, nickname, year, bio.
- **Stats** — global rank, total points, rating, problems solved.
- **Contribution heatmap** — a year of daily activity. Darker squares are busier days; every point-earning action adds 10 to that day.
- **Solved breakdown** — a doughnut chart of Easy / Medium / Hard solves against the total problem count.
- **Query activity** — how many you've asked versus solved.
- **Recent activity** — your latest solves and queries.

Anyone can view anyone's profile from Connect.

---

## Settings

Settings is where you make CodeConnect yours. Everything applies instantly — there is
no save button — and persists across sessions.

### Appearance
- **Theme** — 10 built-in themes including VS Code Dark+ and Light, Dracula, One Dark, Nord, Tokyo Night, Solarized, Gruvbox, and GitHub Dark/Light.
- **Accent colour** — the highlight colour used across the interface.
- **Density** — compact or comfortable spacing.
- **Interface scale** — make everything larger or smaller.
- **Reduce motion** — turn off animations and transitions.

### Editor
The editor's theme is **independent** of the interface theme, so a light UI with a dark
editor is perfectly fine.

- Editor theme, font family, font size
- Tab size and indentation
- Line numbers, line wrapping, active-line highlight
- Bracket matching and auto-closing brackets
- Font ligatures

A live preview shows your changes on real code as you make them.

### Keybindings
Choose **Default**, **Vim**, or **Emacs** keybindings for the editor. The full shortcut
reference is searchable on the same screen.

### Playground
Set your default language and where the output panel sits.

### Profile
Edit your display name, nickname, bio, and year.

You can export your settings to a JSON file and import them on another machine.

---

## Assistant

The chat bubble in the bottom-right corner answers questions about CodeConnect — how
points work, how to enter a contest, what a query stake does. It knows this guide.

It only covers CodeConnect. It won't debug your code or answer general programming
questions — use a query for that, which is what queries are for.

---

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Command palette |
| `Ctrl/Cmd + Enter` | Run code |
| `Ctrl/Cmd + S` | Submit (on a problem) |
| `Ctrl/Cmd + B` | Toggle the icon rail |
| `Ctrl/Cmd + J` | Toggle the output panel |
| `Ctrl/Cmd + /` | Toggle the assistant |
| `Esc` | Close a dialog or the palette |

With Vim keybindings on, editor keys follow Vim; the shortcuts above still work.
