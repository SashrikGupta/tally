import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { useCodeRunner } from '../../hooks/useCodeRunner';
import { Panel } from '../../components/layout/Panel';
import { SplitPane } from '../../components/layout/SplitPane';
import { Pane, Workspace } from '../../components/layout/WorkspaceLayout';
import { EditorPane } from '../../components/editor/EditorPane';
import { OutputPanel } from '../../components/editor/OutputPanel';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { QUERY_TAGS } from '../../lib/constants';

export function QueryPost() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();

  const [language, setLanguage] = useState(settings.playground.defaultLanguage);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [form, setForm] = useState({ title: '', tag: 'others', problemStatement: '', points: '' });
  const [posting, setPosting] = useState(false);

  const { run, running, output, errorText, metrics } = useCodeRunner();
  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.problemStatement || !form.points) {
      toast.warning('Fill in the title, description and stake before posting.');
      return;
    }
    setPosting(true);
    try {
      await api.queries.post({
        author: userId,
        problemStatement: form.problemStatement,
        code,
        points: Number(form.points),
        tag: form.tag,
        title: form.title,
        status: 'unsolved',
      });
      toast.success('Query posted.');
      navigate('/queries');
    } catch (err) {
      toast.error(err.message || 'Could not post your query. Check your points balance.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Workspace>
      <SplitPane
        persistKey="query-post"
        defaultRatio={0.35}
        first={
          <Pane className="pr-0.5">
            <Panel scroll title="New query" className="h-full">
            <form onSubmit={handlePost} className="flex flex-col gap-3 p-4">
              <Input id="q-title" name="title" label="Title" value={form.title} onChange={onChange} required />
              <div className="grid grid-cols-2 gap-3">
                <Select id="q-tag" name="tag" label="Category" value={form.tag} onChange={onChange}>
                  {QUERY_TAGS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <Input id="q-points" name="points" type="number" min="1" label="Stake (points)" value={form.points} onChange={onChange} required />
              </div>
              <Textarea
                id="q-desc"
                name="problemStatement"
                label="What's going wrong?"
                rows={12}
                placeholder="Describe the problem with your code…"
                value={form.problemStatement}
                onChange={onChange}
                required
              />
              <Button type="submit" size="lg" loading={posting}>
                Post query
              </Button>
            </form>
            </Panel>
          </Pane>
        }
        second={
          <SplitPane
            direction="vertical"
            persistKey="query-post-editor"
            defaultRatio={0.6}
            first={
              <Pane className="pb-0.5 pl-0.5">
                <EditorPane
                  className="h-full"
                  value={code}
                  onChange={setCode}
                  language={language}
                  onLanguageChange={setLanguage}
                  onRun={() => run(language, code, input)}
                  running={running}
                  placeholder="Paste the code you're stuck on…"
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
    </Workspace>
  );
}
