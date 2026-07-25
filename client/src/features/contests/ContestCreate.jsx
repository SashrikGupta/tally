import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Panel } from '../../components/layout/Panel';
import { Button, Input } from '../../components/ui';
import { ProblemForm } from '../problems/ProblemForm';

/**
 * Two-step contest wizard: basic details, then one-or-more problems.
 *
 * The old flow lost the LAST problem added on every contest — its submit
 * handler read the `questions` state array in the same synchronous call
 * that had just triggered the state update to append to it, so it always
 * posted the array from one render behind (see Context/07-known-issues.md).
 * Here, each "Add problem" click is its own completed action (ProblemForm
 * awaits the server, then calls back with the created problem) before the
 * user can ever reach the separate "Create contest" button, so the list this
 * component holds is always fully settled by the time it's read.
 */
export function ContestCreate() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState('details');
  const [details, setDetails] = useState({ name: '', start: '', end: '' });
  const [problems, setProblems] = useState([]);
  const [creating, setCreating] = useState(false);

  const onDetailsChange = (e) => setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submitDetails = (e) => {
    e.preventDefault();
    if (!details.name || !details.start || !details.end) return;
    if (new Date(details.end) <= new Date(details.start)) {
      toast.warning('End time must be after the start time.');
      return;
    }
    setStep('problems');
  };

  const finishContest = async () => {
    if (problems.length === 0) {
      toast.warning('Add at least one problem first.');
      return;
    }
    setCreating(true);
    try {
      const contest = await api.contests.create({
        problems: problems.map((p) => p._id),
        author: userId,
        start: details.start,
        end: details.end,
        name: details.name,
      });
      toast.success('Contest created.');
      navigate(`/contests/${contest._id}`);
    } catch (err) {
      toast.error(err.message || 'Could not create the contest.');
    } finally {
      setCreating(false);
    }
  };

  if (step === 'details') {
    return (
      <div className="flex h-full items-center justify-center">
        <Panel title="Contest details" className="w-full max-w-md">
          <form onSubmit={submitDetails} className="flex flex-col gap-3 p-4">
            <Input id="c-name" name="name" label="Name" value={details.name} onChange={onDetailsChange} required />
            <Input
              id="c-start"
              name="start"
              type="datetime-local"
              label="Start"
              value={details.start}
              onChange={onDetailsChange}
              required
            />
            <Input id="c-end" name="end" type="datetime-local" label="End" value={details.end} onChange={onDetailsChange} required />
            <Button type="submit" className="mt-2">
              Next: add problems
            </Button>
          </form>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={details.name}
        description="Add one or more problems, then create the contest."
        actions={
          <Button onClick={finishContest} loading={creating} disabled={problems.length === 0}>
            Create contest ({problems.length} problem{problems.length === 1 ? '' : 's'})
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto themed-scrollbar px-6 pb-6">
        {problems.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-2">
            {problems.map((p) => (
              <li key={p._id} className="flex items-center gap-1.5 rounded-full border border-success-border/40 bg-success/10 px-3 py-1 text-sm text-success-border">
                <IoCheckmarkCircle /> {p.name}
              </li>
            ))}
          </ul>
        )}
        <ProblemForm mode="embedded" onCreated={(p) => setProblems((prev) => [...prev, p])} />
      </div>
    </div>
  );
}
