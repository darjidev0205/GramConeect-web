const socketIo = require('socket.io');
let ioInstance = null;

const init = (server) => {
  ioInstance = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`New socket client connected: ${socket.id}`);

    // Join room specifically for user notifications
    socket.on('join_user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Client ${socket.id} joined room user:${userId}`);
    });

    // Join room for role-wide alerts (user, agent, admin)
    socket.on('join_role', (role) => {
      socket.join(`role:${role}`);
      console.log(`Client ${socket.id} joined room role:${role}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIo = () => {
  return ioInstance;
};

// High-level triggers to push socket notifications/updates
const notifyUser = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('new_notification', notification);
  }
};

const notifyRole = (role, notification) => {
  if (ioInstance) {
    ioInstance.to(`role:${role}`).emit('new_notification', notification);
  }
};

const broadcastNotification = (notification) => {
  if (ioInstance) {
    ioInstance.emit('new_notification', notification);
  }
};

const emitOrderUpdate = (order) => {
  if (ioInstance) {
    ioInstance.emit('order_update', order);
  }
};

const emitDashboardUpdate = (data) => {
  if (ioInstance) {
    ioInstance.emit('dashboard_update', data);
  }
};

module.exports = {
  init,
  getIo,
  notifyUser,
  notifyRole,
  broadcastNotification,
  emitOrderUpdate,
  emitDashboardUpdate
};
