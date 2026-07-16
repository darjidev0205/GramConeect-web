const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketService = require('./services/socket.service');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const otpRoutes = require('./routes/otp.routes');
const hubRoutes = require('./routes/hubs');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');
const ticketRoutes = require('./routes/tickets');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

// Middleware
app.use(cors());
app.use(express.json());

const Hub = require('./models/Hub');

// Database Connection
const seedHubs = async () => {
  try {
    const count = await Hub.countDocuments();
    if (count === 0) {
      await Hub.insertMany([
        { name: "Panchayat Hub", address: "Main Panchayat Building, Zone 1", location: { lat: 20.5937, lng: 78.9629 }, isActive: true },
        { name: "School Hub", address: "Government Primary School, Zone 2", location: { lat: 20.5947, lng: 78.9639 }, isActive: true },
        { name: "Market Hub", address: "Weekly Market Ground, Zone 3", location: { lat: 20.5957, lng: 78.9649 }, isActive: true }
      ]);
      console.log('Default hubs seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding hubs:', err);
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    seedHubs();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('GramConnect API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
