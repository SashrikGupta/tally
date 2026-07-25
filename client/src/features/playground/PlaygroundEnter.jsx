import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { IoAddCircleOutline, IoEnterOutline } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button, Card, Input } from '../../components/ui';
import { Logo } from '../../app/layout/Logo';

export function PlaygroundEnter() {
  const navigate = useNavigate();
  const toast = useToast();
  const { account } = useAuth();

  const [roomId, setRoomId] = useState('');
  // Prefilled from the signed-in account — the old form asked every visitor to
  // retype a name the app already knows.
  const [username, setUsername] = useState(account?.nickname || account?.username || '');

  const enterRoom = (targetRoomId) => {
    if (!targetRoomId.trim() || !username.trim()) {
      toast.warning('Enter a room ID and a display name first.');
      return;
    }
    navigate(`/playground/${targetRoomId.trim()}`, { state: { username: username.trim() } });
  };

  const createRoom = () => {
    if (!username.trim()) {
      toast.warning('Enter a display name first.');
      return;
    }
    enterRoom(uuid());
  };

  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md animate-scale-in overflow-hidden">
        <div className="flex flex-col items-center gap-2 border-b border-border-subtle bg-gradient-to-b from-accent/15 to-transparent px-6 py-8 text-center">
          <Logo size={40} />
          <h1 className="mt-2 text-lg font-semibold text-fg">
            You <span className="text-accent-border">code</span>, we{' '}
            <span className="text-accent-border">connect</span>
          </h1>
          <p className="text-sm text-fg-muted">
            Share a room id and edit the same file together, in realtime.
          </p>
        </div>

        <form
          className="flex flex-col gap-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            enterRoom(roomId);
          }}
        >
          <Input
            label="Display name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="How should others see you?"
          />
          <Input
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Paste a room ID to join"
            hint="Leave blank and create a new room instead."
          />

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" iconLeft={<IoEnterOutline />}>
              Join room
            </Button>
            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border-subtle" />
              <span className="text-[11px] uppercase tracking-wider text-fg-subtle">or</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              iconLeft={<IoAddCircleOutline />}
              onClick={createRoom}
            >
              Create a new room
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
