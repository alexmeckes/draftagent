import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import { createDraftRouter } from './routes/drafts';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/drafts', createDraftRouter(io));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join draft room
  socket.on('join-draft', (draftId: string) => {
    socket.join(`draft-${draftId}`);
    console.log(`Socket ${socket.id} joined draft room: draft-${draftId}`);
  });

  // Leave draft room
  socket.on('leave-draft', (draftId: string) => {
    socket.leave(`draft-${draftId}`);
    console.log(`Socket ${socket.id} left draft room: draft-${draftId}`);
  });

  // Broadcast draft update to room
  socket.on('draft-update', (draftId: string, update: any) => {
    io.to(`draft-${draftId}`).emit('draft-update', update);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});