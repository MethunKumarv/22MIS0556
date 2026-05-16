/**
 * Logging Middleware
 * 
 * Logs incoming HTTP requests with method, path, and timestamp.
 */

const { Log } = require('../../logging_middleware/utils/logger');

/**
 * Request logging middleware
 * 
 * Logs all incoming requests to the logger service
 */
async function requestLogger(req, res, next) {
  try {
    const { method, path, query } = req;
    const queryString = Object.keys(query).length > 0 ? `?${new URLSearchParams(query)}` : '';
    const logMessage = `${method} ${path}${queryString}`;

    await Log('backend', 'info', 'middleware', logMessage);

    // Continue to next middleware
    next();

  } catch (error) {
    // Don't stop request if logging fails
    console.error('Request logger error:', error.message);
    next();
  }
}

/**
 * Error handling middleware
 * 
 * Catches and logs all unhandled errors
 */
async function errorHandler(err, req, res, next) {
  try {
    await Log(
      'backend',
      'error',
      'middleware',
      `Unhandled error: ${err.message}`
    );

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });

  } catch (loggingError) {
    console.error('Error handler middleware failed:', loggingError.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = {
  requestLogger,
  errorHandler
};
