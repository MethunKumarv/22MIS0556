/**
 * Notification API Service
 * 
 * Handles fetching notifications from the external evaluation service API.
 */

const { Log } = require('../../logging_middleware/utils/logger');
const { MOCK_NOTIFICATIONS } = require('../utils/mockData');

const EVALUATION_SERVICE_URL = 'http://4.224.186.213/evaluation-service';
const NOTIFICATIONS_ENDPOINT = `${EVALUATION_SERVICE_URL}/notifications`;
const REQUEST_TIMEOUT_MS = 5000;

async function fetchJsonWithTimeout(url, resourceName) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      const error = new Error(`${resourceName} API returned status ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function shouldUseMockData(error) {
  return Boolean(
    error && (
      error.name === 'AbortError' ||
      error.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      error.status === 401 ||
      error.status === 403 ||
      !error.status
    )
  );
}

/**
 * Fetches all notifications from the evaluation service
 * 
 * @returns {Promise<array>} - Array of notification objects
 * @throws {Error} - If API call fails
 */
async function fetchNotifications() {
  try {
    await Log('backend', 'debug', 'service', `Fetching notifications from ${NOTIFICATIONS_ENDPOINT}`);

    const data = await fetchJsonWithTimeout(NOTIFICATIONS_ENDPOINT, 'Notifications');

    if (!data.notifications || !Array.isArray(data.notifications)) {
      throw new Error('Invalid notifications response format');
    }

    await Log(
      'backend',
      'info',
      'service',
      `Fetched ${data.notifications.length} notifications from API`
    );

    return {
      notifications: data.notifications,
      dataSource: 'external'
    };

  } catch (error) {
    if (shouldUseMockData(error)) {
      await Log('backend', 'warn', 'service', `Notifications API failed, using mock data: ${error.message}`);

      return {
        notifications: MOCK_NOTIFICATIONS,
        dataSource: 'mock'
      };
    }

    await Log('backend', 'error', 'service', `Failed to fetch notifications: ${error.message}`);

    return {
      notifications: MOCK_NOTIFICATIONS,
      dataSource: 'mock'
    };
  }
}

module.exports = {
  fetchNotifications,
  shouldUseMockData
};
