/**
 * Notification App Backend - Main Application
 * 
 * A microservice that provides intelligent notification prioritization
 * and delivery for campus placement, event, and result notifications.
 */

const express = require('express');
const { requestLogger, errorHandler } = require('./middleware/logging');
const routes = require('./routes');

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

app.use('/', routes);

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

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`🔔 Notification App Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📬 Top notifications: http://localhost:${PORT}/notifications/top?limit=10`);
});

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
