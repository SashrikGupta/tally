import { Panel } from '../layout/Panel';
import { CodeEditor } from './CodeEditor';
import { EditorToolbar } from './EditorToolbar';

/**
 * Toolbar + editor as one pane that fills whatever box it is given.
 *
 * Every IDE screen used to inline this as `<EditorToolbar/>` followed by a
 * `<div className="h-[calc(100%-2.5rem)]">`, which silently assumed the toolbar
 * was exactly 40px tall. It isn't — the language `<select>` grew when the form
 * controls were restyled — so the editor's height resolved against `auto`,
 * CodeMirror fell back to sizing itself to its content, and an empty buffer
 * rendered as a single line that only grew when you pressed Enter.
 *
 * The fix is to stop measuring: a flex column with `min-h-0` on the growing
 * child gives the editor a real, definite height at any toolbar size.
 * `min-h-0` is the load-bearing part — flex items default to `min-height:auto`,
 * which refuses to shrink below content and breaks the chain.
 */
export function EditorPane({
  value,
  onChange,
  language,
  onLanguageChange,
  onRun,
  running,
  rightSlot,
  readOnly = false,
  placeholder,
  title,
  icon,
  className,
}) {
  return (
    <Panel title={title} icon={icon} className={className} bodyClassName="flex min-h-0 flex-col">
      <EditorToolbar
        className="shrink-0"
        language={language}
        onLanguageChange={onLanguageChange}
        onRun={onRun}
        running={running}
        rightSlot={rightSlot}
      />
      <div className="min-h-0 flex-1">
        <CodeEditor
          value={value}
          onChange={onChange}
          language={language}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      </div>
    </Panel>
  );
}
