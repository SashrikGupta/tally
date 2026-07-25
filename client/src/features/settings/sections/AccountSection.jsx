import { IoLogOutOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { useAuth } from '../../../contexts/AuthContext';
import { Section } from '../../../components/layout/Section';
import { Avatar, Button, Card } from '../../../components/ui';
import { formatDate } from '../../../lib/format';

export function AccountSection() {
  const { auth0User, account, logout } = useAuth();

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <Section
        title="Connected account"
        description="Managed by Auth0. CodeConnect never stores a password for you."
      >
        <Card className="flex items-center gap-4 p-4">
          <Avatar src={account?.picture || auth0User?.picture} name={account?.username} size="lg" ring />
          <div className="min-w-0">
            <div className="truncate font-medium text-fg">{auth0User?.name ?? account?.nickname ?? '—'}</div>
            <div className="truncate text-sm text-fg-muted">{auth0User?.email ?? '—'}</div>
            {account?.username && <div className="mt-0.5 text-xs text-fg-subtle">@{account.username}</div>}
          </div>
        </Card>
      </Section>

      <Section title="Account details">
        <Card className="divide-y divide-border-subtle text-sm">
          <Row label="Member since" value={account?.createdAt ? formatDate(account.createdAt) : '—'} />
          <Row label="Points" value={account?.points ?? '—'} />
          <Row label="Rating" value={account?.rating ?? '—'} />
        </Card>
      </Section>

      <Section title="Privacy">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-inset p-4 text-sm text-fg-muted">
          <IoShieldCheckmarkOutline className="mt-0.5 shrink-0 text-lg text-success-border" aria-hidden="true" />
          <p className="leading-relaxed">
            Your appearance and editor settings live in this browser only — they are never sent to the
            server. Use Appearance → Backup to move them elsewhere.
          </p>
        </div>
      </Section>

      <Section title="Session">
        <Button variant="danger" onClick={logout} iconLeft={<IoLogOutOutline />} className="w-fit">
          Sign out
        </Button>
      </Section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}
