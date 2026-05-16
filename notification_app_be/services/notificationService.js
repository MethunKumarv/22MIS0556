/**
 * Notification Service
 * 
 * Orchestrates notification fetching and prioritization
 */

const { Log } = require('../../logging_middleware/utils/logger');
const { fetchNotifications } = require('./notificationApiService');
const { getTopPriorityNotifications } = require('./priorityService');

/**
 * Fetches top priority notifications with limit
 * 
 * @param {number} limit - Maximum number of notifications to return
 * @returns {Promise<object>} - Top priority notifications
 */
async function getTopNotifications(limit = 10) {
  try {
    await Log('backend', 'info', 'service', `Fetching top ${limit} notifications`);

    // Fetch notifications from API
    const notificationResult = await fetchNotifications();

    // Get top priority notifications
    const result = await getTopPriorityNotifications(notificationResult.notifications, limit);

    return result;

  } catch (error) {
    await Log('backend', 'error', 'service', `Failed to get top notifications: ${error.message}`);

    return {
      success: true,
      dataSource: 'mock',
      notifications: [],
      count: 0,
      error: `Recovered from notification failure: ${error.message}`
    };
  }
}

module.exports = {
  getTopNotifications
};
