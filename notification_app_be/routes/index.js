/**
 * Routes
 * 
 * Defines all API endpoints for the notification app
 */

const express = require('express');
const { getTopNotificationsHandler } = require('../controllers/notificationController');
const { healthCheck } = require('../controllers/healthController');
const { createUser } = require('../controllers/userController');
const { Log } = require('../../logging_middleware/utils/logger');

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
 * Health check endpoint
 * 
 * GET /health
 */
router.get('/health', routeLogger, healthCheck);

/**
 * Get top priority notifications endpoint
 * 
 * GET /notifications/top?limit=10
 */
router.get('/notifications/top', routeLogger, getTopNotificationsHandler);

/**
 * Demo route for Postman screenshots
 * POST /users
 */
router.post('/users', routeLogger, createUser);

module.exports = router;
