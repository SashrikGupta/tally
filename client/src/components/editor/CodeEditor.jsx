import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView, keymap } from '@codemirror/view';
import { emacsStyleKeymap } from '@codemirror/commands';
import { vim } from '@replit/codemirror-vim';
import { useSettings } from '../../contexts/SettingsContext';
import { resolveEditorTheme } from './themeMap';
import { cn } from '../../lib/cn';

const LANGUAGE_EXTENSION = {
  python: python(),
  cpp: cpp(),
  java: java(),
  javascript: javascript(),
};

/**
 * The single shared code editor for every screen in the app — replaces the
 * old CodeMirror 5 TextEditor/SyncEditor pair. Fully controlled: `value` +
 * `onChange` are the source of truth, so server-loaded code is never lost
 * (the old editor dropped it because it replaced the controlling textarea
 * before React's `value` reached it — see Context/07-known-issues.md).
 */
export function CodeEditor({
  value,
  onChange,
  language = 'python',
  readOnly = false,
  className,
  height = '100%',
  placeholder,
  autoFocus = false,
}) {
  const { settings } = useSettings();
  const { editor, keymap: keymapId } = settings;

  const extensions = useMemo(() => {
    const ext = [LANGUAGE_EXTENSION[language] ?? LANGUAGE_EXTENSION.python];

    if (editor.highlightActiveLine) ext.push(EditorView.theme({ '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, currentColor 6%, transparent)' } }));
    if (editor.lineWrapping) ext.push(EditorView.lineWrapping);
    if (editor.ligatures) ext.push(EditorView.theme({ '&': { fontVariantLigatures: 'normal' } }));
    else ext.push(EditorView.theme({ '&': { fontVariantLigatures: 'none' } }));

    ext.push(EditorView.theme({ '&': { fontSize: `${editor.fontSize}px` }, '.cm-content': { fontFamily: `${editor.fontFamily}, var(--font-mono)` } }));

    if (keymapId === 'vim') ext.push(vim());
    if (keymapId === 'emacs') ext.push(keymap.of(emacsStyleKeymap));

    return ext;
  }, [language, editor, keymapId]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={resolveEditorTheme(editor.theme)}
      extensions={extensions}
      readOnly={readOnly}
      placeholder={placeholder}
      autoFocus={autoFocus}
      height={height}
      // The editor must fill its box rather than size to content: `.cm-editor`
      // gets the height, `.cm-scroller` does the overflow. Without the explicit
      // h-full chain an empty buffer renders as a single line.
      className={cn(
        'h-full min-h-0 w-full text-left',
        '[&_.cm-editor]:h-full [&_.cm-scroller]:h-full [&_.cm-scroller]:overflow-auto',
        '[&_.cm-scroller]:themed-scrollbar',
        className,
      )}
      basicSetup={{
        lineNumbers: editor.lineNumbers,
        foldGutter: true,
        highlightActiveLine: editor.highlightActiveLine,
        bracketMatching: editor.bracketMatching,
        closeBrackets: editor.autoCloseBrackets,
        autocompletion: true,
        tabSize: editor.tabSize,
      }}
      indentWithTab
    />
  );
}
