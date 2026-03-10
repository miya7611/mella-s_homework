import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, saveDatabase } from './database/connection';
import { createTables } from './database/schema';
import { authenticate, requireParent, AuthRequest } from './middleware/auth';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import rewardsRoutes from './routes/rewards';
import timeRoutes from './routes/time';
import statsRoutes from './routes/stats';
import templatesRoutes from './routes/templates';
import commentsRoutes from './routes/comments';
import notificationsRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/tasks/:taskId/comments', commentsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Protected test routes
app.get('/api/me', authenticate, (req: AuthRequest, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/parent-only', authenticate, requireParent, (req: AuthRequest, res) => {
  res.json({ success: true, message: 'Parent access granted' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    const db = await initDatabase();

    // Create tables
    db.run(createTables);
    saveDatabase();

    console.log('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
