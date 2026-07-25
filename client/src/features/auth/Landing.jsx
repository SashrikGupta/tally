import { Navigate, Link } from 'react-router-dom';
import {
  IoFlashOutline,
  IoTrophyOutline,
  IoHelpBuoyOutline,
  IoCodeSlashOutline,
  IoLogoGithub,
  IoLogoGoogle,
  IoArrowForward,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Spinner, Card } from '../../components/ui';
import { takeReturnTo } from '../../lib/storage';

const PILLARS = [
  {
    icon: IoFlashOutline,
    title: 'Arena',
    desc: 'A permanent library of practice problems, filterable by difficulty, with a real editor and a real runner.',
  },
  {
    icon: IoTrophyOutline,
    title: 'Battle',
    desc: 'Timed contests with a live leaderboard that updates as submissions land.',
  },
  {
    icon: IoHelpBuoyOutline,
    title: 'Queries',
    desc: 'Stake points to get unstuck. Earn double solving someone else’s problem.',
  },
  {
    icon: IoCodeSlashOutline,
    title: 'Playground',
    desc: 'Realtime collaborative rooms — a shared editor, a shared runtime, and chat.',
  },
];

const SNIPPET = [
  { t: 'kw', v: 'async function ' },
  { t: 'fn', v: 'solve' },
  { t: 'p', v: '(problem) {' },
];

export function Landing() {
  const { isAuthenticated, isLoading, userId, loginWithGoogle, loginWithGithub } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={28} className="text-accent-border" />
      </div>
    );
  }

  // Signed in already — send them through to wherever they were headed.
  if (isAuthenticated && userId) {
    return <Navigate to={takeReturnTo() ?? '/home'} replace />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16 sm:py-24">
      {/* ---- Hero ---- */}
      <section className="grid animate-rise-in items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-border/40 bg-accent-soft px-3 py-1 text-xs font-medium text-accent-border shadow-[var(--glow-accent-sm)]">
            <IoShieldCheckmarkOutline aria-hidden="true" />
            Sign in with one click — no password to remember
          </span>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <span className="text-gradient">Practise, compete,</span>
            <br />
            <span className="text-fg">and get unstuck together.</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-fg-muted">
            CodeConnect is a coding workspace built like an IDE. Solve problems, run contests, trade
            points for help, and pair-program in a shared room — all in one place, themed exactly the
            way you want it.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={loginWithGoogle} iconLeft={<IoLogoGoogle className="text-lg" />}>
              Continue with Google
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={loginWithGithub}
              iconLeft={<IoLogoGithub className="text-lg" />}
            >
              GitHub
            </Button>
          </div>

          <p className="text-xs text-fg-subtle">
            New here? The same button creates your account.{' '}
            <Link to="/about" className="text-accent-border hover:underline">
              What is CodeConnect?
            </Link>
          </p>
        </div>

        <EditorMock />
      </section>

      {/* ---- Pillars ---- */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-fg">Four rooms, one workspace</h2>
            <p className="mt-1 text-sm text-fg-muted">Everything below is behind the same single sign-in.</p>
          </div>
          <Link
            to="/about"
            className="hidden items-center gap-1.5 text-sm text-accent-border hover:underline sm:inline-flex"
          >
            Read more <IoArrowForward aria-hidden="true" />
          </Link>
        </div>

        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <Card key={p.title} interactive className="flex flex-col items-start gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-border/30 bg-accent-soft text-xl text-accent-border shadow-[var(--glow-accent-sm)]">
                <p.icon aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-fg">{p.title}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Closing CTA ---- */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-elevated p-10 text-center shadow-[var(--shadow-lg),var(--glow-accent)] glass glass-sheen">
        <h2 className="text-2xl font-semibold text-fg">Ready when you are</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">
          One click gets you in. Your theme, layout, and editor preferences follow you from there.
        </p>
        <Button size="lg" className="mt-6" onClick={loginWithGoogle} iconLeft={<IoLogoGoogle className="text-lg" />}>
          Continue with Google
        </Button>
      </section>
    </div>
  );
}

/**
 * Decorative editor window. Not a real editor — mounting CodeMirror on a page
 * that exists to be left as fast as possible isn't worth the bundle.
 */
function EditorMock() {
  return (
    <div className="glass glass-sheen relative overflow-hidden rounded-xl border border-border bg-panel shadow-[var(--shadow-lg),var(--glow-accent-sm)]">
      <div className="flex items-center gap-2 border-b border-border-subtle bg-titlebar px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-hard/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-medium/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-easy/80" />
        <span className="ml-2 font-mono text-[11px] text-fg-subtle">solve.js — CodeConnect</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed">
        <code>
          <Line n={1}>
            <span className="text-fg-subtle">{'// two sum — O(n)'}</span>
          </Line>
          <Line n={2}>
            {SNIPPET.map((s, i) => (
              <span
                key={i}
                className={s.t === 'kw' ? 'text-info-border' : s.t === 'fn' ? 'text-accent-border' : 'text-fg'}
              >
                {s.v}
              </span>
            ))}
          </Line>
          <Line n={3}>
            {'  '}
            <span className="text-info-border">const</span>
            <span className="text-fg"> seen = </span>
            <span className="text-info-border">new</span>
            <span className="text-accent-border"> Map</span>
            <span className="text-fg">();</span>
          </Line>
          <Line n={4}>
            {'  '}
            <span className="text-info-border">for</span>
            <span className="text-fg"> (</span>
            <span className="text-info-border">const</span>
            <span className="text-fg"> [i, n] </span>
            <span className="text-info-border">of</span>
            <span className="text-fg"> nums.entries()) {'{'}</span>
          </Line>
          <Line n={5}>
            {'    '}
            <span className="text-info-border">if</span>
            <span className="text-fg"> (seen.has(target - n)) </span>
            <span className="text-info-border">return</span>
            <span className="text-fg"> [seen.get(target - n), i];</span>
          </Line>
          <Line n={6}>
            {'    '}
            <span className="text-fg">seen.set(n, i);</span>
          </Line>
          <Line n={7}>
            {'  '}
            <span className="text-fg">{'}'}</span>
          </Line>
          <Line n={8}>
            <span className="text-fg">{'}'}</span>
          </Line>
        </code>
      </pre>
      <div className="flex items-center justify-between border-t border-border-subtle bg-inset px-4 py-2 font-mono text-[11px]">
        <span className="text-easy">✓ 12 / 12 tests passed</span>
        <span className="text-fg-subtle">124 ms</span>
      </div>
    </div>
  );
}

function Line({ n, children }) {
  return (
    <span className="flex">
      <span className="mr-4 w-4 shrink-0 select-none text-right text-fg-subtle/60">{n}</span>
      <span className="whitespace-pre">{children}</span>
    </span>
  );
}
