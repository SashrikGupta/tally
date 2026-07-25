import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:2981';

export function createSocket() {
  return io(SOCKET_URL, {
    transports: ['websocket'],
    timeout: 10000,
    reconnectionAttempts: Infinity,
    forceNew: true,
  });
}
