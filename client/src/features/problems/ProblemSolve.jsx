import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useCodeRunner } from '../../hooks/useCodeRunner';
import { useToast } from '../../contexts/ToastContext';
import { Panel } from '../../components/layout/Panel';
import { SplitPane } from '../../components/layout/SplitPane';
import { Pane, Workspace } from '../../components/layout/WorkspaceLayout';
import { EditorPane } from '../../components/editor/EditorPane';
import { OutputPanel } from '../../components/editor/OutputPanel';
import { Badge, DifficultyBadge, Button, Dialog, Spinner, ErrorState } from '../../components/ui';

function normalize(text = '') {
  return text.replace(/\r\n/g, '\n').trim();
}

export function ProblemSolve() {
  const { id } = useParams();
  const location = useLocation();
  const contestId = location.state?.cid ?? null;
  const { userId } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();

  const loadProblem = useCallback(() => api.problems.get(id), [id]);
  const { data: problem, loading, error, refetch } = useAsync(loadProblem, [loadProblem]);

  const [language, setLanguage] = useState(settings.playground.defaultLanguage);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null); // null | 'accepted' | 'wrong'
  const [testResults, setTestResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [solvedModalOpen, setSolvedModalOpen] = useState(false);

  const { run, running, output, errorText, metrics } = useCodeRunner();

  useEffect(() => {
    if (problem?.testcase_input?.[0] != null) setInput(problem.testcase_input[0]);
  }, [problem]);

  const handleRun = async () => {
    if (!problem) return;
    setStatus(null);
    try {
      const result = await run(language, code, input);
      if (!result.error && !result.timedOut && problem.testcase_output?.[0] != null) {
        const matched = normalize(result.output) === normalize(problem.testcase_output[0]);
        setStatus(matched ? 'accepted' : 'wrong');
        await api.contests.checkSolution({ userId, problemId: id, code, solved: matched });
      }
    } catch {
      /* surfaced via OutputPanel's errorText */
    }
  };

  const handleSubmit = async () => {
    if (!problem || !userId) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const cases = [];
      for (let i = 0; i < problem.testcase_input.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const result = await api.runner.run(language, code, problem.testcase_input[i]);
        const passed = !result.error && !result.timedOut && normalize(result.output) === normalize(problem.testcase_output[i]);
        cases.push({ passed });
      }
      const passedCount = cases.filter((c) => c.passed).length;
      const allPassed = passedCount === cases.length;
      setTestResults({ cases, passed: passedCount, total: cases.length });
      setStatus(allPassed ? 'accepted' : 'wrong');

      await api.contests.checkSolution({ userId, problemId: id, code, solved: allPassed });

      if (allPassed) {
        setSolvedModalOpen(true);
        if (contestId) {
          await api.contests.addPoints(contestId, userId, problem.points);
        }
      } else {
        toast.warning(`${passedCount}/${cases.length} test cases passed.`);
      }
    } catch (err) {
      toast.error(err.message || 'Could not submit your solution.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={refetch} className="h-full" />;
  if (!problem) return null;

  return (
    <Workspace>
      <SplitPane
        persistKey="problem-solve"
        defaultRatio={0.32}
        first={
          <Pane className="pr-0.5">
            <Panel scroll className="h-full" title={problem.name}>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={problem.tag} />
                  <Badge variant="accent">{problem.points} pts</Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{problem.desc}</p>

                {problem.testcase_input?.[0] != null && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Sample input</h3>
                    <pre className="overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs">{problem.testcase_input[0]}</pre>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">Sample output</h3>
                    <pre className="overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs">{problem.testcase_output?.[0]}</pre>
                  </div>
                )}
              </div>
            </Panel>
          </Pane>
        }
        second={
          <SplitPane
            direction="vertical"
            persistKey="problem-solve-editor"
            defaultRatio={0.62}
            first={
              <Pane className="pb-0.5 pl-0.5">
                <EditorPane
                  className="h-full"
                  value={code}
                  onChange={setCode}
                  language={language}
                  onLanguageChange={setLanguage}
                  onRun={handleRun}
                  running={running}
                  rightSlot={
                    status && (
                      <Badge variant={status === 'accepted' ? 'success' : 'danger'}>
                        {status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                      </Badge>
                    )
                  }
                />
              </Pane>
            }
            second={
              <Pane className="pl-0.5 pt-0.5">
                <Panel
                  className="h-full"
                  title="Console"
                  bodyClassName="flex min-h-0 flex-col"
                  actions={
                    <Button size="sm" onClick={handleSubmit} loading={submitting}>
                      Submit
                    </Button>
                  }
                >
                  <OutputPanel
                    input={input}
                    onInputChange={setInput}
                    output={output}
                    errorText={errorText}
                    testResults={testResults}
                    metrics={metrics}
                    className="min-h-0 flex-1"
                  />
                </Panel>
              </Pane>
            }
          />
        }
      />

      <Dialog open={solvedModalOpen} onClose={() => setSolvedModalOpen(false)} title="Problem solved">
        <p className="text-sm text-fg-muted">
          Nice work — you earned <span className="font-semibold text-success-border">+{problem.points} points</span>.
        </p>
        <Button className="mt-4 w-full" onClick={() => setSolvedModalOpen(false)}>
          Continue
        </Button>
      </Dialog>
    </Workspace>
  );
}
