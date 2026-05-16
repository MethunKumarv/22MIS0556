/**
 * Notification Controller
 * 
 * Handles notification-related HTTP requests
 */

const { Log } = require('../../logging_middleware/utils/logger');
const { getTopNotifications } = require('../services/notificationService');

/**
 * GET /notifications/top
 * 
 * Returns top priority notifications
 */
async function getTopNotificationsHandler(req, res) {
  try {
    const { limit = 10 } = req.query;

    // Validate limit parameter
    const limitNumber = parseInt(limit, 10);
    if (isNaN(limitNumber) || limitNumber < 1) {
      await Log('backend', 'warn', 'controller', `Invalid limit parameter: ${limit}`);

      return res.status(400).json({
        success: false,
        error: 'Limit must be a positive integer'
      });
    }

    if (limitNumber > 100) {
      await Log('backend', 'warn', 'controller', `Limit too large: ${limitNumber}, capping to 100`);
    }

    const cappedLimit = Math.min(limitNumber, 100);

    await Log(
      'backend',
      'info',
      'controller',
      `GET /notifications/top called with limit=${cappedLimit}`
    );

    // Fetch top notifications
    const result = await getTopNotifications(cappedLimit);

    res.status(200).json({
      success: true,
      dataSource: result.dataSource || 'external',
      count: result.count,
      limit: cappedLimit,
      notifications: result.notifications
    });

  } catch (error) {
    await Log('backend', 'error', 'controller', `Notification controller error: ${error.message}`);

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = {
  getTopNotificationsHandler
};
