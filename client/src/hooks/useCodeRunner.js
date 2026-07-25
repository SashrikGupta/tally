import { useCallback, useState } from 'react';
import { api } from '../lib/api';

/**
 * Shared run-code flow for every screen with a Run button (problem solve,
 * query post/detail, playground). Centralizes the compile-server call so no
 * screen re-implements its own fetch + output-state plumbing.
 */
export function useCodeRunner() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [errorText, setErrorText] = useState('');
  const [metrics, setMetrics] = useState(null);

  const run = useCallback(async (language, code, input) => {
    setRunning(true);
    setErrorText('');
    try {
      const result = await api.runner.run(language, code, input);
      if (result.timedOut) {
        setErrorText('Time limit exceeded (5s).');
        setOutput('');
      } else if (result.error) {
        setErrorText(result.error);
        setOutput('');
      } else {
        setOutput(result.output ?? '');
        setErrorText('');
      }
      setMetrics(result.metrics ?? null);
      return result;
    } catch (err) {
      setErrorText(err.message || 'Failed to reach the compilation server.');
      setOutput('');
      setMetrics(null);
      throw err;
    } finally {
      setRunning(false);
    }
  }, []);

  return { run, running, output, errorText, metrics, setOutput, setErrorText };
}
