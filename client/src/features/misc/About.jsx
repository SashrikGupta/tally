import { Link } from 'react-router-dom';
import {
  IoCodeSlashOutline,
  IoColorPaletteOutline,
  IoFlashOutline,
  IoHelpBuoyOutline,
  IoLockClosedOutline,
  IoLogoGoogle,
  IoPeopleOutline,
  IoTrophyOutline,
} from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../../components/ui';

const FEATURES = [
  {
    icon: IoFlashOutline,
    title: 'Arena — practice problems',
    body: 'Browse a shared library of problems by difficulty, write a solution in the built-in editor, and run it against the sample and hidden cases. Python, C++ and Java are supported.',
  },
  {
    icon: IoTrophyOutline,
    title: 'Battle — timed contests',
    body: 'Anyone can author a contest: set a window, attach problems, assign point values. Registered participants get a live leaderboard that reorders as solutions are accepted.',
  },
  {
    icon: IoHelpBuoyOutline,
    title: 'Queries — help, priced in points',
    body: 'Stuck? Post the problem and stake some of your points on it. Whoever solves it collects double. Everyone starts with 500, so asking has a real cost and helping has a real reward.',
  },
  {
    icon: IoCodeSlashOutline,
    title: 'Playground — collaborative rooms',
    body: 'Create a room, share the id, and edit the same buffer together in realtime with chat alongside. Useful for pairing on an interview question or walking someone through a fix.',
  },
  {
    icon: IoPeopleOutline,
    title: 'Connect — the directory',
    body: 'Every member ranked by points, with profiles showing solved-problem breakdowns, query activity, and a contribution heatmap.',
  },
  {
    icon: IoColorPaletteOutline,
    title: 'Yours to configure',
    body: 'Eighteen themes from Dark+ to Abyss to Synthwave, plus independent control over glass opacity, backdrop blur, neon glow, shadow depth, corner radius and wallpaper. Settings apply instantly and persist locally.',
  },
];

const FAQ = [
  {
    q: 'How do accounts work?',
    a: 'Sign-in is handled entirely by Auth0. Click "Continue with Google" and you are in — the same button creates your account the first time. CodeConnect never sees or stores a password, because there is no password field anywhere in the product.',
  },
  {
    q: 'What is stored about me?',
    a: 'A username derived from your email, your display name and avatar from the identity provider, plus whatever you write in your profile — a bio and a year. Everything else on your profile is derived from what you do: points, rating, solved problems, queries.',
  },
  {
    q: 'How do points work?',
    a: 'You start with 500. Posting a query stakes points against it; solving someone else’s query pays out double the stake. Contests award their own point values per problem.',
  },
  {
    q: 'Do my appearance settings sync?',
    a: 'They are stored in this browser, not on the server. Settings → Appearance has Export and Import buttons if you want to move a look to another machine.',
  },
];

export function About() {
  const { isAuthenticated, loginWithGoogle } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-16">
      <header className="flex animate-rise-in flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-gradient">About CodeConnect</span>
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-fg-muted">
          CodeConnect is a single workspace for the things programmers actually do together: grind
          practice problems, run contests, ask for help without it being a favour, and sit in the
          same editor as someone else. It is laid out like an IDE because that is where the work
          happens.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-fg">What&apos;s inside</h2>
        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title} className="flex flex-col gap-2.5 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-border/30 bg-accent-soft text-lg text-accent-border">
                <f.icon aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-fg">{f.title}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
          <IoLockClosedOutline className="text-accent-border" aria-hidden="true" />
          Access and accounts
        </h2>
        <Card className="divide-y divide-border-subtle">
          {FAQ.map((item) => (
            <div key={item.q} className="p-5">
              <h3 className="font-medium text-fg">{item.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{item.a}</p>
            </div>
          ))}
        </Card>
      </section>

      <section className="rounded-xl border border-border bg-elevated p-8 text-center shadow-[var(--shadow-lg),var(--glow-accent-sm)] glass glass-sheen">
        {isAuthenticated ? (
          <>
            <h2 className="text-xl font-semibold text-fg">You&apos;re signed in</h2>
            <Link to="/home">
              <Button size="lg" className="mt-5">
                Open your workspace
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-fg">Start in one click</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
              No form, no password, no email confirmation step.
            </p>
            <Button
              size="lg"
              className="mt-5"
              onClick={loginWithGoogle}
              iconLeft={<IoLogoGoogle className="text-lg" />}
            >
              Continue with Google
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
