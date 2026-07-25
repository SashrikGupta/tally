import { cn } from '../../lib/cn';

/**
 * Gutter for a SplitPane child.
 *
 * The panes themselves must stay flush so the drag handle sits between them;
 * the spacing belongs *inside* each pane. Doing it with padding on this wrapper
 * (plus `border-box` sizing, set globally in tokens.css) means the Panel can be
 * a plain `h-full` — no `h-[calc(100%-1rem)]` that has to be kept in sync with
 * whatever margin it happens to carry.
 */
export function Pane({ className, children }) {
  return <div className={cn('h-full min-h-0 p-1.5', className)}>{children}</div>;
}

/**
 * Root for the IDE-style screens: fills the shell's content area exactly, so
 * the page never scrolls as a whole and each pane scrolls independently.
 */
export function Workspace({ className, children }) {
  return <div className={cn('flex h-full min-h-0 flex-col overflow-hidden', className)}>{children}</div>;
}
