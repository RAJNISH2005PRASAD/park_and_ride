const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle parking slot updates
    socket.on('parking-update', (data) => {
      io.emit('parking-slot-updated', data);
    });

    // Handle ride status updates
    socket.on('ride-update', (data) => {
      io.emit('ride-status-updated', data);
    });

    // Handle notifications
    socket.on('send-notification', (data) => {
      io.to(`user-${data.userId}`).emit('new-notification', data);
    });

    // Handle real-time location updates
    socket.on('location-update', (data) => {
      io.emit('driver-location-updated', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = { setupSocketIO }; 