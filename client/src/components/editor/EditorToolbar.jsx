import { IoPlayOutline, IoRefreshOutline, IoCopyOutline, IoExpandOutline } from 'react-icons/io5';
import { LANGUAGES } from '../../lib/constants';
import { Button, Select, Tooltip } from '../../components/ui';
import { cn } from '../../lib/cn';

export function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  running = false,
  onReset,
  onCopy,
  onFullscreen,
  rightSlot,
  className,
}) {
  return (
    <div className={cn('flex items-center justify-between gap-2 border-b border-border-subtle px-2 py-1.5', className)}>
      <div className="flex items-center gap-2">
        <Select
          aria-label="Language"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="!w-32 !py-1 text-xs"
          wrapperClassName="shrink-0"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-1.5">
        {rightSlot}
        {onCopy && (
          <Tooltip label="Copy code">
            <Button variant="ghost" size="sm" onClick={onCopy} aria-label="Copy code">
              <IoCopyOutline />
            </Button>
          </Tooltip>
        )}
        {onReset && (
          <Tooltip label="Reset">
            <Button variant="ghost" size="sm" onClick={onReset} aria-label="Reset">
              <IoRefreshOutline />
            </Button>
          </Tooltip>
        )}
        {onFullscreen && (
          <Tooltip label="Fullscreen">
            <Button variant="ghost" size="sm" onClick={onFullscreen} aria-label="Fullscreen">
              <IoExpandOutline />
            </Button>
          </Tooltip>
        )}
        {onRun && (
          <Button variant="success" size="sm" onClick={onRun} loading={running} iconLeft={!running && <IoPlayOutline />}>
            Run
          </Button>
        )}
      </div>
    </div>
  );
}
