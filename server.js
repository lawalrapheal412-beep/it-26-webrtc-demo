const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    console.log(`User joined room: ${roomId}`);
    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);

    if (room && room.size > 1) {
      socket.to(roomId).emit('user-joined');
    }

    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on('offer', ({ roomId, offer }) => {
    console.log(`Offer sent in room ${roomId}`);
    socket.to(roomId).emit('offer', { offer });
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`Answer sent in room ${roomId}`);
    socket.to(roomId).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log(`ICE candidate relayed in room ${roomId}`);
    socket.to(roomId).emit('ice-candidate', {
      candidate,
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  app.get('/', (req, res) => {
    res.send('WebRTC Signaling Server Running');
  })
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
