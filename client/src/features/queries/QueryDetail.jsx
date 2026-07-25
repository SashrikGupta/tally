import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { useCodeRunner } from '../../hooks/useCodeRunner';
import { Panel } from '../../components/layout/Panel';
import { SplitPane } from '../../components/layout/SplitPane';
import { Pane, Workspace } from '../../components/layout/WorkspaceLayout';
import { EditorPane } from '../../components/editor/EditorPane';
import { OutputPanel } from '../../components/editor/OutputPanel';
import { Badge, Button, Dialog, Spinner, ErrorState } from '../../components/ui';
import { QUERY_TAGS } from '../../lib/constants';

const TAG_LABEL = Object.fromEntries(QUERY_TAGS.map((t) => [t.value, t.label]));

export function QueryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();

  const loadQuery = useCallback(() => api.queries.get(id), [id]);
  const { data: query, loading, error, refetch } = useAsync(loadQuery, [loadQuery]);

  const [language, setLanguage] = useState(settings.playground.defaultLanguage);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [solving, setSolving] = useState(false);

  const { run, running, output, errorText, metrics } = useCodeRunner();

  // The asker's original (broken) code, used to prefill the editor. Fully
  // controlled via `value={code || codeRef}` below — unlike the old
  // CodeMirror 5 editor, this can never silently drop the loaded code.
  const codeRef = query?.code ?? '';

  const handleConfirmSolve = async () => {
    if (!query) return;
    setSolving(true);
    try {
      await api.queries.solve({ qid: id, uid: userId, sol: code, io: output || '-/-' });

      const author = typeof query.author === 'object' ? query.author : null;
      if (author?.email) {
        await api.users.sendMail(
          author.email,
          `Someone accepted to solve your query`,
          `Good news — your query "${query.title}" has an incoming solution. Join room ${id} in the Playground to collaborate.`,
        );
      }

      toast.success('Marked as solved. Redirecting you to a playground room to collaborate…');
      navigate(`/playground/${id}`, { state: { username: 'Solver' } });
    } catch (err) {
      toast.error(err.message || 'Could not mark this query as solved.');
    } finally {
      setSolving(false);
      setConfirmOpen(false);
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
  if (!query) return null;

  const isSolved = query.status === 'solved';

  return (
    <Workspace>
      <SplitPane
        persistKey="query-detail"
        defaultRatio={0.32}
        first={
          <Pane className="pr-0.5">
            <Panel scroll title={query.title} className="h-full">
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">{TAG_LABEL[query.tag] ?? query.tag}</Badge>
                  <Badge variant="accent">{query.points} pts</Badge>
                  <Badge variant={isSolved ? 'success' : 'warning'}>{isSolved ? 'Solved' : 'Unsolved'}</Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{query.problemStatement}</p>
              </div>
            </Panel>
          </Pane>
        }
        second={
          <SplitPane
            direction="vertical"
            persistKey="query-detail-editor"
            defaultRatio={0.62}
            first={
              <Pane className="pb-0.5 pl-0.5">
                <EditorPane
                  className="h-full"
                  value={code || codeRef}
                  onChange={setCode}
                  language={language}
                  onLanguageChange={setLanguage}
                  onRun={() => run(language, code || codeRef, input)}
                  running={running}
                  rightSlot={
                    !isSolved && (
                      <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
                        Solve
                      </Button>
                    )
                  }
                />
              </Pane>
            }
            second={
              <Pane className="pl-0.5 pt-0.5">
                <Panel className="h-full" title="Console" bodyClassName="flex min-h-0 flex-col">
                  <OutputPanel
                    input={input}
                    onInputChange={setInput}
                    output={output}
                    errorText={errorText}
                    metrics={metrics}
                    className="min-h-0 flex-1"
                  />
                </Panel>
              </Pane>
            }
          />
        }
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Solve this query?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={solving} onClick={handleConfirmSolve}>
              Confirm & notify author
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          This marks the query solved, emails the author, and opens a Playground room so you can
          walk through the fix together.
        </p>
      </Dialog>
    </Workspace>
  );
}
