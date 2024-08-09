const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors') ; 
const { Server } = require('socket.io');
const server = http.createServer(app);
const dotenv = require('dotenv'); // Import dotenv

// Load environment variables from config.env

const ACTIONS = {
  JOIN : 'join' , 
  JOINED : 'joined' , 
  DISCONNECTED : 'disconnected' , 
  CODE_CHANGE : 'code-change' , 
  SYNC_CHANGE : 'sync-code' , 
  LEAVE : 'leave' , 
} ;
dotenv.config({ path: './config.env' });
app.use(cors())
const PORT = process.env.PORT || 2981; // Use PORT from environment variables or default to 2981

const io = new Server(server);

const userSocketMap = {};

function getALLConnectedClients(roomId) {
  console.log("ok1") ; 
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketid) => {
    return {
      socketid,
      username: userSocketMap[socketid],
    };
  });
}

io.on('connection', (socket) => {
  console.log("ok2") ;
  console.log('socket connected', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getALLConnectedClients(roomId);
    console.log(clients);
    clients.forEach(({ socketid }) => {
      io.to(socketid).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketid: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    console.log("ok3") ;
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('chat', ({ roomId, chat_text, username }) => {
    console.log("ok4") ;
    socket.in(roomId).emit('chat', { chat_text, username });
  });

  socket.on(ACTIONS.SYNC_CHANGE, ({ socketid, code }) => {
    console.log("ok5") ;
    io.to(socketid).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnecting', () => {
    console.log("ok6") ;
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

app.use('/', (req, res) => {
  console.log("ok7") ;
  res.send(`hello ${PORT}`);
  
});

server.listen(PORT, () => {
  console.log('listening on port', PORT);
});
