const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config({ path: './.env' });

const ACTIONS = require('./actions');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 2981;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

// socketId -> username, for the lifetime of the connection.
const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
}

io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketid: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CHANGE, ({ socketid, code }) => {
    io.to(socketid).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.CHAT, ({ roomId, text, username }) => {
    socket.in(roomId).emit(ACTIONS.CHAT, { text, username, at: Date.now() });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms].filter((room) => room !== socket.id);
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

app.get('/health', (req, res) => res.json({ ok: true, connections: io.engine.clientsCount }));

server.listen(PORT, () => {
  console.log(`socket_service listening on port ${PORT}`);
});
