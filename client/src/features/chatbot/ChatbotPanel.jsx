import { useEffect, useRef, useState } from 'react';
import { IoChatbubbleEllipsesOutline, IoClose, IoSend, IoRefreshOutline } from 'react-icons/io5';
import { api } from '../../lib/api';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { Button } from '../../components/ui';
import { cn } from '../../lib/cn';

const WELCOME = { role: 'assistant', content: "Hi! I'm the CodeConnect assistant. Ask me how points, contests, or the playground work." };

export function ChatbotPanel() {
  const [open, setOpen] = useLocalStorage('codeconnect:chatbot-open', false);
  const [messages, setMessages] = useState([WELCOME]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  useKeyboardShortcut('mod+/', () => setOpen((o) => !o));

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  const send = async (retryText) => {
    const text = retryText ?? draft.trim();
    if (!text || streaming) return;

    setError(null);
    const history = messages.filter((m) => m !== WELCOME).map((m) => ({ role: m.role, content: m.content }));
    if (!retryText) {
      setMessages((prev) => [...prev, { role: 'user', content: text }]);
      setDraft('');
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await api.chat.stream(
        text,
        history,
        (_delta, full) => {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', content: full };
            return next;
          });
        },
        { signal: controller.signal },
      );
    } catch (err) {
      setError(err.message || 'The assistant is unavailable right now.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) send(lastUser.content);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open assistant"
        title="Assistant (Ctrl /)"
        className="group fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-accent-border bg-accent text-accent-fg shadow-[var(--shadow-lg),var(--glow-accent)] transition-all duration-base ease-spring hover:scale-110 hover:brightness-110 active:scale-95"
      >
        <IoChatbubbleEllipsesOutline className="text-xl transition-transform duration-base group-hover:rotate-6" />
      </button>
    );
  }

  return (
    <div className="glass glass-sheen fixed bottom-4 right-4 z-40 flex h-[28rem] w-[21rem] animate-scale-in flex-col overflow-hidden rounded-xl border border-border bg-overlay shadow-[var(--shadow-overlay),var(--glow-accent-sm)]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent-border/30 bg-accent-soft text-accent-border">
            <IoChatbubbleEllipsesOutline />
          </span>
          <div>
            <h3 className="text-sm font-semibold leading-tight text-fg">Assistant</h3>
            <p className="text-[11px] leading-tight text-fg-subtle">Ask about CodeConnect</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="rounded-md p-1 text-fg-muted transition-colors hover:bg-elevated hover:text-fg"
        >
          <IoClose />
        </button>
      </div>

      <div ref={listRef} className="themed-scrollbar flex-1 overflow-y-auto px-3 py-3">
        <ul className="flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <li key={i} className={cn('flex animate-rise-in', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'rounded-br-sm border border-accent-border/30 bg-accent-soft text-fg'
                    : 'rounded-bl-sm border border-border-subtle bg-elevated text-fg',
                )}
              >
                {m.content || (streaming && i === messages.length - 1 ? <TypingDots /> : '')}
              </div>
            </li>
          ))}
        </ul>
        {error && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-danger-border/40 bg-danger/10 px-2.5 py-1.5 text-xs text-danger-border">
            <span>{error}</span>
            <button type="button" onClick={retry} className="flex items-center gap-1 font-medium hover:underline">
              <IoRefreshOutline /> Retry
            </button>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border-subtle p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask a question…"
          aria-label="Message the assistant"
          className="h-9 flex-1 rounded-md border border-border bg-inset px-3 text-sm text-fg outline-none transition-all duration-fast placeholder:text-fg-subtle focus:border-accent-border focus:shadow-[var(--glow-accent-sm)]"
        />
        <Button size="sm" onClick={() => send()} loading={streaming} aria-label="Send" className="h-9 w-9 p-0">
          {!streaming && <IoSend />}
        </Button>
      </div>
    </div>
  );
}

/** Three-dot typing indicator — reads as "thinking" better than a spinner. */
function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-fg-subtle"
          style={{ animation: 'pulse-glow 1.1s ease-in-out infinite', animationDelay: `${i * 180}ms` }}
        />
      ))}
    </span>
  );
}
