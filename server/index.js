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

// Store connected users with their location and radius
const users = new Map();

// Calculate distance between two locations (Haversine formula)
function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(loc2.latitude - loc1.latitude);
  const dLon = toRadians(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(loc1.latitude)) *
      Math.cos(toRadians(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Find users within proximity of each other
function findUsersInRange(userId) {
  const user = users.get(userId);
  if (!user || !user.location) {
    return [];
  }

  const usersInRange = [];

  users.forEach((otherUser, otherUserId) => {
    if (userId === otherUserId || !otherUser.location) {
      return;
    }

    const distance = calculateDistance(user.location, otherUser.location);

    // Check if within both users' radius
    if (distance <= user.radius && distance <= otherUser.radius) {
      usersInRange.push(otherUserId);
    }
  });

  return usersInRange;
}

// Notify users about changes in proximity
function updateProximity(userId) {
  const usersInRange = findUsersInRange(userId);
  const user = users.get(userId);

  if (!user) {
    return;
  }

  // Find new users (in range now but weren't before)
  const newUsers = usersInRange.filter((id) => !user.connectedUsers.has(id));

  // Find users that left (were in range but aren't anymore)
  const leftUsers = Array.from(user.connectedUsers).filter(
    (id) => !usersInRange.includes(id)
  );

  // Update connected users
  user.connectedUsers = new Set(usersInRange);

  // Notify about new users
  newUsers.forEach((newUserId) => {
    io.to(userId).emit('user-joined', newUserId);
    io.to(newUserId).emit('user-joined', userId);

    // Add to other user's connected set
    const otherUser = users.get(newUserId);
    if (otherUser) {
      otherUser.connectedUsers.add(userId);
    }
  });

  // Notify about users that left
  leftUsers.forEach((leftUserId) => {
    io.to(userId).emit('user-left', leftUserId);
    io.to(leftUserId).emit('user-left', userId);

    // Remove from other user's connected set
    const otherUser = users.get(leftUserId);
    if (otherUser) {
      otherUser.connectedUsers.delete(userId);
    }
  });

  // Send complete list of users in range
  io.to(userId).emit('users-in-range', usersInRange);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Initialize user data
  users.set(socket.id, {
    socketId: socket.id,
    location: null,
    radius: 1,
    connectedUsers: new Set(),
  });

  // Send user their ID
  socket.emit('connected', socket.id);

  // Handle location updates
  socket.on('update-location', (data) => {
    const user = users.get(socket.id);
    if (user) {
      user.location = data.location;
      user.radius = data.radius;
      console.log(`User ${socket.id} updated location:`, data.location, 'radius:', data.radius);
      updateProximity(socket.id);
    }
  });

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    console.log(`Relaying offer from ${socket.id} to ${data.userId}`);
    io.to(data.userId).emit('offer', {
      userId: socket.id,
      offer: data.offer,
    });
  });

  socket.on('answer', (data) => {
    console.log(`Relaying answer from ${socket.id} to ${data.userId}`);
    io.to(data.userId).emit('answer', {
      userId: socket.id,
      answer: data.answer,
    });
  });

  socket.on('ice-candidate', (data) => {
    console.log(`Relaying ICE candidate from ${socket.id} to ${data.userId}`);
    io.to(data.userId).emit('ice-candidate', {
      userId: socket.id,
      candidate: data.candidate,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const user = users.get(socket.id);
    if (user) {
      // Notify all connected users
      user.connectedUsers.forEach((connectedUserId) => {
        io.to(connectedUserId).emit('user-left', socket.id);

        // Remove from their connected sets
        const connectedUser = users.get(connectedUserId);
        if (connectedUser) {
          connectedUser.connectedUsers.delete(socket.id);
        }
      });
    }

    users.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
