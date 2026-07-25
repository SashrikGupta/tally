import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTIONS } from '../lib/constants';

/**
 * Shared-buffer editing for the Playground. Takes a live socket *instance*
 * (not a ref) so effects correctly re-run when the connection is (re)established
 * — depending on a ref's `.current` in a useEffect dependency array never
 * re-triggers the effect and was the root cause of remote edits silently never
 * applying in the old implementation (see Context/07-known-issues.md).
 *
 * Echo suppression: a remote `code-change` event updates local state directly
 * without re-emitting it back to the room.
 */
export function useCollaborativeEditor({ socket, roomId, initialCode = '' }) {
  const [code, setCodeState] = useState(initialCode);
  const suppressBroadcast = useRef(false);

  useEffect(() => {
    if (!socket) return undefined;
    const onRemoteChange = ({ code: incoming }) => {
      if (incoming == null) return;
      suppressBroadcast.current = true;
      setCodeState(incoming);
    };
    socket.on(ACTIONS.CODE_CHANGE, onRemoteChange);
    return () => socket.off(ACTIONS.CODE_CHANGE, onRemoteChange);
  }, [socket]);

  const onChange = useCallback(
    (value) => {
      setCodeState(value);
      if (suppressBroadcast.current) {
        suppressBroadcast.current = false;
        return;
      }
      socket?.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
    },
    [socket, roomId],
  );

  /** Set the buffer without broadcasting — used for the initial sync-code reply. */
  const setLocalOnly = useCallback((value) => {
    suppressBroadcast.current = true;
    setCodeState(value);
  }, []);

  return { code, onChange, setLocalOnly };
}
