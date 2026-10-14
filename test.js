let io;

function initSocket(server) {
const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
    socket.on('joinRoom', (userId) => socket.join(userId.toString()));
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized yet!");
  return io;
}

module.exports = { initSocket, getIO };
