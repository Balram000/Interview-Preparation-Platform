const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const interviewRoutes = require('./routes/interview');
const questionRoutes = require('./routes/question');
const performanceRoutes = require('./routes/performance');
const adminRoutes = require('./routes/admin');
const resumeRoutes = require('./routes/resume');
const codingRoutes = require('./routes/coding');
const hrRoutes = require('./routes/hr');
const mlRoutes = require('./routes/ml');
const aiProvider = require('./services/aiProvider');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS configuration (CLIENT_URL accepts a comma-separated list of origins)
const allowedOrigins = config.clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/ml', mlRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    env: config.nodeEnv,
    aiEnabled: aiProvider.isEnabled()
  });
});

// Serve the built client from the API process in production, when present
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
const hasClientBuild = fs.existsSync(path.join(clientBuildPath, 'index.html'));

if (!hasClientBuild) {
  app.get('/', (req, res) => res.send('API RUNNING'));
}

if (hasClientBuild) {
  app.use(express.static(clientBuildPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

module.exports = app;
