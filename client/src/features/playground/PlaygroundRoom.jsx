import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createSocket } from '../../lib/socket';
import { ACTIONS } from '../../lib/constants';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useCodeRunner } from '../../hooks/useCodeRunner';
import { useCollaborativeEditor } from '../../hooks/useCollaborativeEditor';
import { Panel } from '../../components/layout/Panel';
import { SplitPane } from '../../components/layout/SplitPane';
import { Pane, Workspace } from '../../components/layout/WorkspaceLayout';
import { EditorPane } from '../../components/editor/EditorPane';
import { OutputPanel } from '../../components/editor/OutputPanel';
import { Avatar, Badge, Spinner } from '../../components/ui';
import { RoomChat } from './RoomChat';

/**
 * Collaborative room. Every hook is called unconditionally, in the same
 * order, on every render — the redirect-when-no-username guard runs only
 * *after* all hooks, in the JSX. The old version returned early before some
 * of its effects, which crashed React ("Rendered fewer hooks than expected")
 * on a direct navigation to a room URL. See Context/07-known-issues.md.
 */
export function PlaygroundRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useSettings();

  const username = location.state?.username ?? null;

  const [socket, setSocket] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState(settings.playground.defaultLanguage);
  const [input, setInput] = useState('');

  const { code, onChange: onCodeChange } = useCollaborativeEditor({ socket, roomId, initialCode: '' });
  const codeSnapshot = useRef('');
  codeSnapshot.current = code;

  const { run, running, output, errorText, metrics } = useCodeRunner();

  useEffect(() => {
    if (!username) return undefined;

    let active = true;
    let currentSocket = null;

    (async () => {
      const s = createSocket();
      currentSocket = s;

      s.on('connect_error', () => {
        if (!active) return;
        toast.error('Could not connect to the playground server.');
        navigate('/playground');
      });

      s.on(ACTIONS.JOINED, ({ clients: roomClients, username: joinedUsername, socketid }) => {
        if (!active) return;
        setClients(roomClients);
        if (joinedUsername !== username) toast.info(`${joinedUsername} joined the room.`);
        s.emit(ACTIONS.SYNC_CHANGE, { socketid, code: codeSnapshot.current });
      });

      s.on(ACTIONS.DISCONNECTED, ({ socketId, username: leftUsername }) => {
        if (!active) return;
        toast.info(`${leftUsername} left the room.`);
        setClients((prev) => prev.filter((c) => c.socketId !== socketId));
      });

      s.on(ACTIONS.CHAT, (message) => {
        if (!active) return;
        setMessages((prev) => [...prev, message]);
      });

      s.emit(ACTIONS.JOIN, { roomId, username });
      if (active) {
        setSocket(s);
        setConnecting(false);
      }
    })();

    return () => {
      active = false;
      currentSocket?.disconnect();
    };
  }, [roomId, username]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendChat = (text) => {
    socket?.emit(ACTIONS.CHAT, { roomId, text, username });
    setMessages((prev) => [...prev, { text, username, at: Date.now() }]);
  };

  if (!username) {
    return <Navigate to="/playground" replace />;
  }

  if (connecting) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <Workspace>
      <SplitPane
        persistKey="playground-room"
        defaultRatio={0.26}
        first={
          <Pane className="pr-0.5">
            <Panel
              className="h-full"
              title="Room"
              bodyClassName="flex min-h-0 flex-col"
              actions={<Badge variant="accent">{roomId.slice(0, 8)}</Badge>}
            >
              <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-border-subtle p-2">
                {clients.map((c) => (
                  <span
                    key={c.socketId}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-inset py-0.5 pl-0.5 pr-2 text-xs"
                  >
                    <Avatar name={c.username} size="xs" />
                    {c.username}
                  </span>
                ))}
              </div>
              <RoomChat messages={messages} onSend={sendChat} currentUsername={username} />
            </Panel>
          </Pane>
        }
        second={
          <SplitPane
            direction="vertical"
            persistKey="playground-room-editor"
            defaultRatio={0.62}
            first={
              <Pane className="pb-0.5 pl-0.5">
                <EditorPane
                  className="h-full"
                  value={code}
                  onChange={onCodeChange}
                  language={language}
                  onLanguageChange={setLanguage}
                  onRun={() => run(language, code, input)}
                  running={running}
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
