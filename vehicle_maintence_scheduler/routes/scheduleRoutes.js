/**
 * Schedule Routes
 *
 * This router owns the scheduler endpoints so app.js can mount them directly
 * with app.use('/', scheduleRoutes).
 */

const express = require('express');
const { Log } = require('../../logging_middleware/utils/logger');
const { getSchedule } = require('../controllers/scheduleController');
const { healthCheck } = require('../controllers/healthController');

const router = express.Router();

async function routeLogger(req, res, next) {
  try {
    await Log('backend', 'info', 'route', `${req.method} ${req.originalUrl} called`);
  } catch (error) {
    console.error('Route logging failed:', error.message);
  }

  next();
}

/**
 * Health check endpoint.
 */
router.get('/health', routeLogger, healthCheck);

/**
 * Generate optimal schedule for a specific depot.
 */
router.get('/schedule/:depotId', routeLogger, getSchedule);

module.exports = router;