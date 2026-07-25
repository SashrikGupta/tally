import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5';
import { api } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Panel } from '../../components/layout/Panel';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { CONTEST_POINT_OPTIONS, DIFFICULTIES } from '../../lib/constants';

const EMPTY = { name: '', points: '', tag: '', desc: '' };

/**
 * Single shared problem-authoring form — replaces the ~150 duplicated lines
 * that used to live separately in add_contest/question.jsx and
 * add_problem.jsx (see Context/07-known-issues.md).
 *
 * mode="standalone": posts one problem, then navigates to the Arena.
 * mode="embedded":   used inside contest creation; calls onCreated(problem)
 *                    with the server's response and resets the form, without
 *                    ever relying on component state that might be stale —
 *                    that stale-closure bug was what silently dropped the
 *                    last question added to every contest in the old app.
 */
export function ProblemForm({ mode = 'standalone', onCreated }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [testCases, setTestCases] = useState([]);
  const [currentIn, setCurrentIn] = useState('');
  const [currentOut, setCurrentOut] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addTestCase = () => {
    if (!currentIn.trim() && !currentOut.trim()) return;
    setTestCases((prev) => [...prev, { input: currentIn, output: currentOut }]);
    setCurrentIn('');
    setCurrentOut('');
  };

  const removeTestCase = (index) => setTestCases((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    setForm(EMPTY);
    setTestCases([]);
    setCurrentIn('');
    setCurrentOut('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.points || !form.tag || !form.desc) {
      toast.warning('Fill in every field before adding the problem.');
      return;
    }
    if (testCases.length === 0) {
      toast.warning('Add at least one test case.');
      return;
    }

    setSubmitting(true);
    try {
      const { problem } = await api.contests.addProblem({
        name: form.name,
        tag: form.tag,
        difficulty: form.points,
        desc: form.desc,
        testcase_input: testCases.map((t) => t.input),
        testcase_output: testCases.map((t) => t.output),
        points: Number(form.points),
      });

      if (mode === 'standalone') {
        toast.success('Problem added to the Arena.');
        navigate('/problems');
      } else {
        toast.success(`"${form.name}" added.`);
        onCreated?.({ _id: problem, name: form.name });
        reset();
      }
    } catch (err) {
      toast.error(err.message || 'Could not add the problem.');
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Problem details" bodyClassName="flex flex-col gap-3 p-4">
        <Input id="p-name" name="name" label="Name" value={form.name} onChange={onChange} required />
        <div className="grid grid-cols-2 gap-3">
          <Select id="p-points" name="points" label="Points" value={form.points} onChange={onChange} required>
            <option value="" disabled>
              Select points
            </option>
            {CONTEST_POINT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Select id="p-tag" name="tag" label="Difficulty" value={form.tag} onChange={onChange} required>
            <option value="" disabled>
              Select difficulty
            </option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
        <Textarea id="p-desc" name="desc" label="Description" rows={10} value={form.desc} onChange={onChange} required />
      </Panel>

      <Panel title="Test cases" bodyClassName="flex flex-col gap-3 p-4">
        <Textarea label="Input" rows={4} value={currentIn} onChange={(e) => setCurrentIn(e.target.value)} />
        <Textarea label="Expected output" rows={4} value={currentOut} onChange={(e) => setCurrentOut(e.target.value)} />
        <Button type="button" variant="secondary" iconLeft={<IoAddOutline />} onClick={addTestCase}>
          Add test case
        </Button>

        {testCases.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {testCases.map((tc, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border border-border bg-inset px-3 py-1.5 text-sm">
                <span className="text-fg-muted">
                  Test case {i + 1} {i === 0 && <span className="text-fg-subtle">(shown as sample)</span>}
                </span>
                <button type="button" onClick={() => removeTestCase(i)} className="text-fg-subtle hover:text-danger-border" aria-label="Remove">
                  <IoTrashOutline />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button type="submit" size="lg" loading={submitting} className="mt-auto">
          {mode === 'standalone' ? 'Add problem' : 'Add problem to contest'}
        </Button>
      </Panel>
    </form>
  );

  if (mode === 'embedded') return content;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="New problem" description="Add a problem to the Arena." />
      <div className="flex-1 overflow-y-auto themed-scrollbar px-6 pb-6">{content}</div>
    </div>
  );
}
