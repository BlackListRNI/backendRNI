const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const connectDatabase = require('./database');

// Import routes
const reportRoutes = require('../modules/reports/report.routes');
const disputeRoutes = require('../modules/disputes/dispute.routes');
const userRoutes = require('../modules/users/user.routes');
const moderationRoutes = require('../modules/moderation/moderation.routes');
const geoRoutes = require('../modules/geo/geo.routes');
const authRoutes = require('../modules/auth/auth.routes');
const commentRoutes = require('../modules/comments/comment.routes');

// Import middleware
const errorHandler = require('../shared/middleware/errorHandler');
const requestLogger = require('../shared/middleware/requestLogger');

const app = express();

// Security middleware
app.use(helmet());

// CORS - allow multiple origins
const allowedOrigins = config.frontendUrl.split(',').map(url => url.trim());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server (only if not imported as module)
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = app;
