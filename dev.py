#!/usr/bin/env python3
"""
Start every CodeConnect service at once, and stop every one of them on exit.

    python dev.py                 # start everything
    python dev.py --only client central
    python dev.py --install       # npm install anything missing first, then start
    python dev.py --list          # show the service table and exit
    python dev.py --keep-logs     # don't wipe logs/ on startup
    python dev.py --reset-db      # wipe the database first, then start clean

Ctrl-C (or closing the terminal) shuts the whole stack down. That is the part
worth being careful about on Windows: `npm`/`npx` are batch shims that spawn a
real node process as a *child*, so terminating the process you launched leaves
the service holding its port. Every process here is therefore started in its own
process group / job, and torn down as a tree — see stop() below.

Every service also writes to logs/<service>.log, plus a combined logs/all.log.
The directory is cleared on each run so what's in there is always the current
session — pass --keep-logs to append across runs instead.

Requires: Python 3.8+, Node 18+, and a running MongoDB for the central service.
No third-party Python packages.
"""

from __future__ import annotations

import argparse
import io
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LOG_DIR = ROOT / "logs"
IS_WINDOWS = os.name == "nt"


# --------------------------------------------------------------------------
# Service table
# --------------------------------------------------------------------------


@dataclass
class Service:
    key: str
    name: str
    cwd: Path
    command: list[str]
    port: int | None = None
    color: str = "37"
    # Node services need `npm install`; the chat service needs pip.
    node_project: bool = True
    optional: bool = False
    note: str = ""

    proc: subprocess.Popen | None = field(default=None, init=False, repr=False)
    log_file: io.TextIOWrapper | None = field(default=None, init=False, repr=False)


def npm(*args: str) -> list[str]:
    """npm is npm.cmd on Windows; resolving it here keeps shell=False."""
    exe = shutil.which("npm.cmd" if IS_WINDOWS else "npm") or "npm"
    return [exe, *args]


SERVICES: list[Service] = [
    Service(
        key="central",
        name="central-api",
        cwd=ROOT / "services" / "central_service",
        command=["node", "server.js"],
        port=1934,
        color="36",  # cyan
        note="needs MongoDB on 27017",
    ),
    Service(
        key="compile",
        name="compile-api",
        cwd=ROOT / "services" / "compilation_service",
        command=["node", "index.js"],
        port=2982,
        color="33",  # yellow
    ),
    Service(
        key="socket",
        name="socket-api",
        cwd=ROOT / "services" / "socket_service",
        command=["node", "index.js"],
        port=2981,
        color="35",  # magenta
    ),
    Service(
        key="chat",
        name="chat-api",
        cwd=ROOT / "services" / "ml_service",
        command=[sys.executable, "app.py"],
        port=2983,
        color="34",  # blue
        node_project=False,
        optional=True,
        note="Flask + torch; skipped unless deps are installed",
    ),
    Service(
        key="client",
        name="client",
        cwd=ROOT / "client",
        command=npm("run", "dev"),
        port=5173,
        color="32",  # green
    ),
]

BY_KEY = {s.key: s for s in SERVICES}


# --------------------------------------------------------------------------
# Output
# --------------------------------------------------------------------------

# A Windows console defaults to cp1252, which cannot encode the box-drawing
# characters below — printing one raises UnicodeEncodeError and takes the whole
# launcher down. Ask for UTF-8 first, then verify; if the stream still can't
# take them, fall back to ASCII rather than risk a crash mid-run.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except (AttributeError, OSError):
    pass


def _encodable(sample: str) -> bool:
    try:
        sample.encode(sys.stdout.encoding or "ascii")
        return True
    except (UnicodeEncodeError, LookupError):
        return False


UNICODE_OK = _encodable("─│")
RULE = "──" if UNICODE_OK else "--"
PIPE = "│" if UNICODE_OK else "|"

# Windows terminals only understand ANSI once a console mode bit is set; on
# older hosts the call fails harmlessly and we fall back to plain text.
USE_COLOR = sys.stdout.isatty()
if USE_COLOR and IS_WINDOWS:
    try:
        import ctypes

        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        USE_COLOR = False

LABEL_WIDTH = max(len(s.name) for s in SERVICES)
print_lock = threading.Lock()

# Combined log — every service interleaved, which is what you want when a
# request crosses two of them and you need the ordering.
combined_log: io.TextIOWrapper | None = None

ANSI_RE = re.compile(r"\x1b\[[0-9;]*[a-zA-Z]")


def paint(text: str, color: str, bold: bool = False) -> str:
    if not USE_COLOR:
        return text
    return f"\033[{'1;' if bold else ''}{color}m{text}\033[0m"


def strip_ansi(text: str) -> str:
    """Log files get plain text — Vite's colour codes are noise in a file."""
    return ANSI_RE.sub("", text)


def write_log(handle: io.TextIOWrapper | None, label: str, line: str) -> None:
    if handle is None:
        return
    stamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    try:
        handle.write(f"{stamp} {label} | {strip_ansi(line)}\n")
        handle.flush()  # flushed per line so a crash never loses the last thing said
    except (ValueError, OSError):
        pass


def log(service: Service | None, line: str) -> None:
    label = service.name if service else "dev.py"
    color = service.color if service else "90"
    with print_lock:
        print(f"{paint(label.rjust(LABEL_WIDTH), color, bold=True)} {PIPE} {line}", flush=True)
        if service is not None:
            write_log(service.log_file, label, line)
        write_log(combined_log, label, line)


def banner(text: str) -> None:
    with print_lock:
        print(paint(f"\n{RULE} {text}", "90"), flush=True)
        write_log(combined_log, "dev.py", f"{RULE} {text}")


# --------------------------------------------------------------------------
# Log files
# --------------------------------------------------------------------------


def open_logs(services: list[Service], keep: bool) -> None:
    """
    Prepare logs/ and open a handle per service plus the combined file.

    Cleared by default: a log directory that accumulates across runs makes you
    check timestamps to know whether you're reading this run or last Tuesday's.
    Only *.log is removed, so nothing else that lands in the folder is at risk.
    """
    global combined_log

    LOG_DIR.mkdir(exist_ok=True)

    if not keep:
        removed, locked = 0, 0
        for old in LOG_DIR.glob("*.log"):
            try:
                old.unlink()
                removed += 1
            except OSError:
                locked += 1
        if removed:
            print(paint(f"cleared {removed} previous log file(s) from logs/", "90"), flush=True)
        if locked:
            # On Windows an open handle blocks unlink. In practice that means
            # another dev.py is live (or a tail/editor has the file open), and
            # two writers interleaving into one file helps nobody.
            print(
                paint(
                    f"{locked} log file(s) are held open by another process — "
                    "is another dev.py already running? Appending instead of clearing.",
                    "33",
                ),
                flush=True,
            )
            keep = True

    mode = "a" if keep else "w"
    combined_log = open(LOG_DIR / "all.log", mode, encoding="utf-8", errors="replace")
    for svc in services:
        svc.log_file = open(LOG_DIR / f"{svc.name}.log", mode, encoding="utf-8", errors="replace")

    header = f"CodeConnect session started {datetime.now().isoformat(timespec='seconds')}"
    write_log(combined_log, "dev.py", header)
    for svc in services:
        write_log(svc.log_file, svc.name, header)


def close_logs(services: list[Service]) -> None:
    for svc in services:
        if svc.log_file:
            try:
                svc.log_file.close()
            except OSError:
                pass
            svc.log_file = None
    global combined_log
    if combined_log:
        try:
            combined_log.close()
        except OSError:
            pass
        combined_log = None


# --------------------------------------------------------------------------
# Preflight
# --------------------------------------------------------------------------


def port_in_use(port: int) -> bool:
    """
    True if anything is listening on `port`, on either IP stack.

    Both are checked deliberately: Vite binds ::1 only, so an IPv4-only probe
    reports the port free, Vite then discovers the clash itself and silently
    moves to 5174 — which the servers' CORS allowlist does not include. A
    stale dev server would break the app in a way that looks like a CORS bug.
    """
    for family, host in ((socket.AF_INET, "127.0.0.1"), (socket.AF_INET6, "::1")):
        try:
            with socket.socket(family, socket.SOCK_STREAM) as sock:
                sock.settimeout(0.4)
                if sock.connect_ex((host, port)) == 0:
                    return True
        except OSError:
            continue  # stack unavailable on this host
    return False


def preflight(services: list[Service], auto_install: bool) -> list[Service]:
    """Drops services that can't start, and installs deps when asked to."""
    ready: list[Service] = []

    for svc in services:
        if not svc.cwd.is_dir():
            log(None, paint(f"skipping {svc.name}: {svc.cwd} not found", "31"))
            continue

        if svc.node_project and not (svc.cwd / "node_modules").is_dir():
            if auto_install:
                log(None, f"installing dependencies for {svc.name}...")
                result = subprocess.run(npm("install"), cwd=svc.cwd)
                if result.returncode != 0:
                    log(None, paint(f"npm install failed for {svc.name}; skipping", "31"))
                    continue
            else:
                log(
                    None,
                    paint(
                        f"skipping {svc.name}: no node_modules. Run with --install, "
                        f"or `npm install` in {svc.cwd.relative_to(ROOT)}",
                        "33",
                    ),
                )
                continue

        # The chat server is optional: without its Python deps it would crash
        # on import and spam the log, so check before rather than after.
        if svc.key == "chat" and not chat_deps_present(svc):
            log(None, paint(f"skipping {svc.name}: Python deps missing ({svc.note})", "90"))
            continue

        if svc.port and port_in_use(svc.port):
            log(None, paint(f"skipping {svc.name}: port {svc.port} already in use", "33"))
            continue

        ready.append(svc)

    return ready


def reset_database(assume_yes: bool) -> bool:
    """
    Drop every CodeConnect collection before starting.

    Delegates to the central service's own `scripts/reset-db.js` rather than
    reimplementing it here: that script sits next to the models, already knows
    which collections belong to the app, and refuses to touch a shared database.
    Running it as a subprocess also means `npm run reset-db` and this flag can
    never disagree about what "reset" means.

    Inherits stdio so its confirmation prompt actually reaches the terminal.
    """
    service = BY_KEY["central"]
    if not service.cwd.is_dir():
        log(None, paint(f"cannot reset: {service.cwd} not found", "31"))
        return False

    banner("resetting the database")
    command = ["node", "scripts/reset-db.js"]
    if assume_yes:
        command.append("--yes")

    try:
        result = subprocess.run(command, cwd=service.cwd)
    except FileNotFoundError as err:
        log(None, paint(f"cannot reset: {err}", "31"))
        return False

    if result.returncode != 0:
        log(None, paint("database reset did not complete - not starting", "31"))
        return False

    log(None, paint("database reset", "32"))
    return True


def chat_deps_present(svc: Service) -> bool:
    probe = subprocess.run(
        [sys.executable, "-c", "import flask, flask_cors"],
        cwd=svc.cwd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return probe.returncode == 0


# --------------------------------------------------------------------------
# Start / stop
# --------------------------------------------------------------------------


def spawn(svc: Service) -> bool:
    """
    Start one service in its own process group so the whole tree can be killed.

    Windows: CREATE_NEW_PROCESS_GROUP lets us send CTRL_BREAK, and the group id
    is what `taskkill /T` walks to reach npm's node grandchild.
    POSIX: start_new_session puts the service in its own session, so killpg
    reaches every process it forks.
    """
    kwargs: dict = {
        "cwd": svc.cwd,
        "stdout": subprocess.PIPE,
        "stderr": subprocess.STDOUT,
        "stdin": subprocess.DEVNULL,
        "text": True,
        "bufsize": 1,
        # Node and Flask both write UTF-8; without this the pipe is decoded with
        # the Windows locale codec and Vite's "➜" arrives as mojibake.
        "encoding": "utf-8",
        "errors": "replace",
        # Vite and friends emit colour only when they believe a TTY is present;
        # piping loses that, so ask explicitly.
        "env": {**os.environ, "FORCE_COLOR": "1", "PYTHONUNBUFFERED": "1"},
    }

    if IS_WINDOWS:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["start_new_session"] = True

    try:
        svc.proc = subprocess.Popen(svc.command, **kwargs)
    except FileNotFoundError as err:
        log(None, paint(f"could not start {svc.name}: {err}", "31"))
        return False

    threading.Thread(target=pump_output, args=(svc,), daemon=True).start()
    where = f" :{svc.port}" if svc.port else ""
    log(None, f"started {paint(svc.name, svc.color, bold=True)}{where} (pid {svc.proc.pid})")
    return True


def pump_output(svc: Service) -> None:
    """Relays a service's output, prefixed, until it closes its pipe."""
    assert svc.proc and svc.proc.stdout
    try:
        for line in svc.proc.stdout:
            line = line.rstrip()
            if line:
                log(svc, line)
    except (ValueError, OSError):
        pass  # pipe closed during shutdown


def stop(svc: Service, timeout: float = 6.0) -> None:
    """Terminate a service and every process it spawned."""
    proc = svc.proc
    if not proc or proc.poll() is not None:
        return

    try:
        if IS_WINDOWS:
            # taskkill /T is the only reliable way to reach the node process
            # behind npm.cmd; terminate() alone would orphan it on its port.
            subprocess.run(
                ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except (ProcessLookupError, PermissionError, OSError):
        pass

    try:
        proc.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            if not IS_WINDOWS:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
            else:
                proc.kill()
        except (ProcessLookupError, PermissionError, OSError):
            pass

    log(None, f"stopped {svc.name}")


def stop_all(services: list[Service]) -> None:
    banner("shutting down")
    # Reverse order: the client is the one users have open, so it goes first
    # and the API it talks to outlives it by a moment.
    for svc in reversed(services):
        stop(svc)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run the whole CodeConnect stack; Ctrl-C stops all of it.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--only",
        nargs="+",
        metavar="KEY",
        choices=list(BY_KEY),
        help=f"start a subset: {', '.join(BY_KEY)}",
    )
    parser.add_argument("--install", action="store_true", help="npm install missing deps before starting")
    parser.add_argument("--list", action="store_true", help="print the service table and exit")
    parser.add_argument(
        "--reset-db",
        action="store_true",
        help="drop every CodeConnect collection before starting (asks to confirm)",
    )
    parser.add_argument(
        "--yes",
        "-y",
        action="store_true",
        help="skip the --reset-db confirmation prompt",
    )
    parser.add_argument(
        "--keep-logs",
        action="store_true",
        help="append to logs/ instead of clearing it first",
    )
    args = parser.parse_args()

    if args.list:
        print(f"\n{'KEY':<9}{'SERVICE':<14}{'PORT':<8}PATH")
        for svc in SERVICES:
            rel = svc.cwd.relative_to(ROOT)
            print(f"{svc.key:<9}{svc.name:<14}{str(svc.port or '-'):<8}{rel}" + (f"  ({svc.note})" if svc.note else ""))
        return 0

    selected = [BY_KEY[k] for k in args.only] if args.only else list(SERVICES)

    # Before any logging: the reset script owns the terminal for its prompt, and
    # a failed reset must stop the run rather than start on data the user
    # believes is gone.
    if args.reset_db and not reset_database(assume_yes=args.yes):
        return 1

    # Opened before preflight so the "skipping X" decisions are on record too.
    open_logs(selected, keep=args.keep_logs)

    banner("starting CodeConnect")
    running = preflight(selected, auto_install=args.install)
    running = [svc for svc in running if spawn(svc)]

    if not running:
        # Every service skipped on "port already in use" is the signature of a
        # second launch. Say so, rather than leaving the user to infer it from
        # a list of individually-plausible skip messages.
        busy = [svc for svc in selected if svc.port and port_in_use(svc.port)]
        if len(busy) == len(selected):
            log(None, paint("everything is already running - another dev.py has the stack up", "33"))
        else:
            log(None, paint("nothing started - see the messages above", "31"))
        close_logs(selected)
        return 1

    log(None, paint(f"logging to {LOG_DIR.relative_to(ROOT)}{os.sep} (all.log + one per service)", "90"))

    client = next((s for s in running if s.key == "client"), None)
    if client:
        time.sleep(1.2)  # let Vite print its own banner first
        log(None, paint(f"open http://localhost:{client.port}", "32", bold=True))
    log(None, paint("press Ctrl-C to stop everything", "90"))

    # Ctrl-C on Windows reaches this process, not the new process groups, so
    # KeyboardInterrupt here is the single shutdown path for the whole stack.
    try:
        while True:
            for svc in running:
                if svc.proc and svc.proc.poll() is not None:
                    log(None, paint(f"{svc.name} exited with code {svc.proc.returncode}", "31"))
                    running.remove(svc)
                    break
            if not running:
                log(None, paint("all services exited", "31"))
                return 1
            time.sleep(0.4)
    except KeyboardInterrupt:
        print()
        return 0
    finally:
        stop_all(running)
        close_logs(selected)


if __name__ == "__main__":
    sys.exit(main())
