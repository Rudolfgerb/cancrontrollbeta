import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import playerRoutes from './routes/player.routes.js';
import spotRoutes from './routes/spot.routes.js';
import graffitiRoutes from './routes/graffiti.routes.js';
import gameRoutes from './routes/game.routes.js';

// Import security middleware
import {
  validateEnvironment,
  getCorsOptions,
  getHelmetConfig,
  apiLimiter,
  authLimiter,
  sanitizeInput,
  securityLogger,
  securityErrorHandler,
} from './middleware/security.middleware.js';

// Load and validate environment variables
dotenv.config();
validateEnvironment();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: getCorsOptions(),
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Connect to database
connectDB();

// Trust proxy (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security Middleware (order matters!)
app.use(helmet(getHelmetConfig()));
app.use(cors(getCorsOptions()));
app.use(compression()); // Compress responses
app.use(securityLogger); // Custom security logging
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput); // Sanitize all inputs

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/player', apiLimiter, playerRoutes);
app.use('/api/spots', apiLimiter, spotRoutes);
app.use('/api/graffiti', apiLimiter, graffitiRoutes);
app.use('/api/game', apiLimiter, gameRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join player room
  socket.on('join-player-room', (playerId) => {
    socket.join(`player:${playerId}`);
    console.log(`Player ${playerId} joined their room`);
  });

  // Painting session events
  socket.on('start-painting', (data) => {
    socket.join(`painting:${data.spotId}`);
    socket.emit('painting-started', { success: true });
  });

  socket.on('stroke-update', (data) => {
    socket.to(`painting:${data.spotId}`).emit('stroke-added', data);
  });

  socket.on('stealth-update', (data) => {
    socket.emit('stealth-changed', data);
  });

  socket.on('risk-event', (data) => {
    socket.emit('new-risk-event', data);
  });

  socket.on('police-alert', (data) => {
    socket.emit('police-triggered', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// 404 handler (must be before error handlers)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware (order matters!)
app.use(securityErrorHandler); // Handle security-specific errors first

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🎨 Can Controll Backend Server             ║
║   Server running on port ${PORT}              ║
║   Environment: ${process.env.NODE_ENV}           ║
║   WebSocket: ENABLED                          ║
╚═══════════════════════════════════════════════╝
  `);
});

export { io };
export default app;
