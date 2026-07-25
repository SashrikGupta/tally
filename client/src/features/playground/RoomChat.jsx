import { useEffect, useRef, useState } from 'react';
import { IoChatbubblesOutline, IoSend } from 'react-icons/io5';
import { cn } from '../../lib/cn';
import { Button, EmptyState } from '../../components/ui';

export function RoomChat({ messages, onSend, currentUsername }) {
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    // flex-1 + min-h-0, not h-full: this is a flex item inside the Panel body,
    // and h-full would ignore the sibling participant strip above it.
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="themed-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {messages.length === 0 ? (
          <EmptyState
            icon={<IoChatbubblesOutline />}
            title="No messages yet"
            description="Say hello to get started."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {messages.map((m, i) => {
              const mine = m.username === currentUsername;
              return (
                <li key={`${m.username}-${i}-${m.at ?? ''}`} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                  <div className={cn('max-w-[85%] rounded-lg px-2.5 py-1.5 text-sm', mine ? 'bg-accent/20 text-fg' : 'bg-overlay text-fg')}>
                    <div className="text-[10px] font-semibold text-fg-subtle">{m.username}</div>
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-border-subtle p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message the room…"
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-inset px-3 text-sm text-fg outline-none transition-all duration-fast placeholder:text-fg-subtle focus:border-accent-border focus:shadow-[var(--glow-accent-sm)]"
        />
        <Button size="sm" onClick={send} aria-label="Send">
          <IoSend />
        </Button>
      </div>
    </div>
  );
}
