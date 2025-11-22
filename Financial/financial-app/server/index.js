require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Middleware
const { authenticateToken } = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth');
const forecastRoutes = require('./routes/forecast');
const transactionsRoutes = require('./routes/transactions');
const scenariosRoutes = require('./routes/scenarios');
const debtsRoutes = require('./routes/debts');
const strategyRoutes = require('./routes/strategy');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'financial-app',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/debts', authenticateToken, debtsRoutes); // Protected with auth middleware
app.use('/api/strategy', authenticateToken, strategyRoutes); // Protected with auth middleware

// Protected route example (for testing middleware)
app.get('/api/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Access granted to protected resource',
    user: {
      userId: req.user.userId,
      username: req.user.username
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server (only if not being required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Financial App server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
