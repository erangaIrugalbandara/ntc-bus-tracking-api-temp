require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const { protect } = require('./middleware/auth');
const envConfig = require('./config/environment');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: envConfig.corsOrigins,
    methods: ["GET", "POST"],
    credentials: false
  }
});

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDB();

// Trust proxy (important for deployment)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: envConfig.corsOrigins,
  credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Client can subscribe to specific bus updates
  socket.on('subscribe-bus', (busNumber) => {
    socket.join(`bus-${busNumber}`);
    console.log(`Client ${socket.id} subscribed to bus ${busNumber}`);
  });

  // Client can subscribe to all buses
  socket.on('subscribe-all-buses', () => {
    socket.join('all-buses');
    console.log(`Client ${socket.id} subscribed to all buses`);
  });

  // Client can subscribe to route updates
  socket.on('subscribe-route', (routeId) => {
    socket.join(`route-${routeId}`);
    console.log(`Client ${socket.id} subscribed to route ${routeId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NTC Bus Tracking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    websocket: 'enabled'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', protect, adminRoutes);

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const PORT = envConfig.port;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket server running`);
  console.log(`API Base URL: ${envConfig.apiBaseUrl}`);
});