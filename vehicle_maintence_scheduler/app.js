/**
 * Vehicle Maintenance Scheduler - Main Application
 * 
 * A microservice that solves the vehicle maintenance scheduling problem
 * using the 0/1 Knapsack algorithm to maximize maintenance impact within
 * available mechanic hours.
 */

const express = require('express');
const { requestLogger, errorHandler } = require('./middleware/logging');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();

// ============================================================
// MIDDLEWARE SETUP
// ============================================================

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload'
    });
  }

  return next(error);
});

// Custom logging middleware
app.use(requestLogger);

// ============================================================
// ROUTES
// ============================================================

app.use('/', scheduleRoutes);

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// SERVER STARTUP
// ============================================================

const START_PORT = parseInt(process.env.PORT || '3001', 10);

function startServer(port, attemptsRemaining = 10) {
  const server = app.listen(port, () => {
    console.log(`🚀 Vehicle Maintenance Scheduler running on port ${port}`);
    console.log(`📍 Health check: http://localhost:${port}/health`);
    console.log(`📋 Schedule endpoint: http://localhost:${port}/schedule/:depotId`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attemptsRemaining > 0) {
      console.warn(`Port ${port} is already in use, retrying on ${port + 1}`);
      server.close(() => startServer(port + 1, attemptsRemaining - 1));
      return;
    }

    console.error('Failed to start Vehicle Maintenance Scheduler:', error.message);
    process.exit(1);
  });

  return server;
}

const server = startServer(START_PORT);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
