import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoOpenOutline } from 'react-icons/io5';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { Section } from '../../../components/layout/Section';
import { Avatar, Button, Card, Input, Select, Textarea } from '../../../components/ui';
import { YEAR_OPTIONS } from '../../../lib/constants';

const BIO_LIMIT = 500;

const EMPTY = { nickname: '', description: '', year: '' };

/**
 * Edits the three user-owned profile fields.
 *
 * Reads from the account already resolved by AuthContext rather than
 * re-fetching: that account is the same document the server would return, and
 * fetching it again here meant the form could briefly render blank inputs and
 * clobber in-progress edits when the response landed.
 */
export function ProfileSection() {
  const { account, userId, patchAccount } = useAuth();
  const toast = useToast();

  const initial = useMemo(
    () =>
      account
        ? {
            nickname: account.nickname ?? '',
            description: account.description ?? '',
            year: account.year ?? '',
          }
        : EMPTY,
    [account],
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(initial), [initial]);

  const dirty = useMemo(
    () => Object.keys(initial).some((key) => form[key] !== initial[key]),
    [form, initial],
  );

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!userId || !dirty) return;
    setSaving(true);
    try {
      const updated = await api.users.update(userId, form);
      // Push the server's version back into the session so the title bar,
      // status bar and profile page all update without a reload.
      patchAccount({
        nickname: updated.nickname,
        description: updated.description,
        year: updated.year,
      });
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!account) return null;

  return (
    <form onSubmit={save} className="flex max-w-xl flex-col gap-8">
      <Section
        title="Identity"
        description="Your username and avatar come from the account you signed in with and can't be changed here."
        actions={
          <Link to={`/u/${userId}`}>
            <Button type="button" variant="ghost" size="sm" iconRight={<IoOpenOutline />}>
              View
            </Button>
          </Link>
        }
      >
        <Card className="flex items-center gap-4 p-4">
          <Avatar src={account.picture} name={account.username} size="lg" />
          <div className="min-w-0">
            <div className="truncate font-medium text-fg">@{account.username}</div>
            <div className="truncate text-sm text-fg-muted">{account.email}</div>
          </div>
        </Card>
      </Section>

      <Section title="Public profile" description="Shown to anyone who visits your profile page.">
        <div className="flex flex-col gap-4">
          <Input
            label="Display name"
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            maxLength={60}
            placeholder={account.username}
            hint="Shown instead of your username across the app."
          />
          <Textarea
            label="Bio"
            name="description"
            rows={4}
            maxLength={BIO_LIMIT}
            value={form.description}
            onChange={onChange}
            placeholder="What are you working on?"
            hint={`${form.description.length} / ${BIO_LIMIT}`}
          />
          <Select label="Year" name="year" value={form.year} onChange={onChange}>
            <option value="">Not specified</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving} disabled={!dirty}>
          Save changes
        </Button>
        {dirty && (
          <Button type="button" variant="ghost" onClick={() => setForm(initial)}>
            Discard
          </Button>
        )}
      </div>
    </form>
  );
}
