const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// Store active rooms
const rooms = new Map();

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle join room
    socket.on('join-room', (data) => {
        const { roomCode, userId, userName } = data;

        socket.join(roomCode);
        console.log(`User ${userId} joined room ${roomCode}`);

        // Initialize room if it doesn't exist
        if (!rooms.has(roomCode)) {
            rooms.set(roomCode, new Map());
        }

        const room = rooms.get(roomCode);
        room.set(userId, {
            socketId: socket.id,
            userName,
            id: userId,
        });

        // Send current peer list to the new user
        const peers = Array.from(room.values()).map((user) => ({
            id: user.id,
            name: user.userName,
        }));

        socket.emit('peer-list', { peers });

        // Notify others about the new peer
        socket.to(roomCode).emit('peer-list', { peers });
    });

    // Handle signal relay
    socket.on('signal', (data) => {
        const { to, from, payload } = data;

        // Find the socket ID of the target peer
        for (const room of rooms.values()) {
            const targetUser = Array.from(room.values()).find((u) => u.id === to);
            if (targetUser) {
                io.to(targetUser.socketId).emit('signal', {
                    from,
                    payload,
                });
                break;
            }
        }
    });

    // Handle leave room
    socket.on('leave-room', (data) => {
        const { roomCode, userId } = data;

        const room = rooms.get(roomCode);
        if (room) {
            room.delete(userId);
            console.log(`User ${userId} left room ${roomCode}`);

            // Send updated peer list
            const peers = Array.from(room.values()).map((user) => ({
                id: user.id,
                name: user.userName,
            }));

            io.to(roomCode).emit('peer-list', { peers });

            // Delete room if empty
            if (room.size === 0) {
                rooms.delete(roomCode);
            }
        }

        socket.leave(roomCode);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Clean up user from all rooms
        for (const [roomCode, room] of rooms.entries()) {
            for (const [userId, user] of room.entries()) {
                if (user.socketId === socket.id) {
                    room.delete(userId);

                    const peers = Array.from(room.values()).map((u) => ({
                        id: u.id,
                        name: u.userName,
                    }));

                    io.to(roomCode).emit('peer-list', { peers });

                    if (room.size === 0) {
                        rooms.delete(roomCode);
                    }
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
