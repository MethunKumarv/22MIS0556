/**
 * Priority Notification Service
 * 
 * Implements the priority inbox logic to rank and sort notifications based on:
 * 1. Type priority (Placement > Result > Event)
 * 2. Recency (newer notifications ranked higher)
 * 3. Importance (combination of type and time)
 * 
 * No database queries - all sorting done in-code as per requirements.
 */

const { Log } = require('../../logging_middleware/utils/logger');

// Priority values for each notification type
const TYPE_PRIORITY = {
  'Placement': 3,  // Highest priority
  'Result': 2,     // Medium priority
  'Event': 1       // Lowest priority
};

const PRIORITY_LEVELS = Object.freeze({
  PLACEMENT: 3,
  RESULT: 2,
  EVENT: 1
});

/**
 * Calculates the priority score for a single notification
 * 
 * Formula: TypePriority * 1000 + RecencyScore
 * 
 * This ensures type priority dominates, with recency as a tiebreaker
 * 
 * @param {object} notification - Notification object
 * @param {number} currentTime - Current time in milliseconds
 * @returns {number} - Priority score (higher = more important)
 */
function calculatePriorityScore(notification, currentTime) {
  // Get type priority (0-3)
  const typePriority = TYPE_PRIORITY[notification.Type] || 0;

  // Parse timestamp
  let timestamp;
  try {
    timestamp = new Date(notification.Timestamp).getTime();
  } catch (error) {
    timestamp = currentTime;
  }

  // Calculate recency score (0-1000)
  // Newer notifications get higher scores
  const ageMs = currentTime - timestamp;
  const oneDay = 24 * 60 * 60 * 1000;
  const recencyScore = Math.max(0, 1000 - (ageMs / oneDay) * 100);

  // Combined priority score
  const priorityScore = (typePriority * 1000) + recencyScore;

  return priorityScore;
}

/**
 * Sorts notifications by priority and recency
 * 
 * @param {array} notifications - Array of notification objects
 * @returns {array} - Sorted notifications (highest priority first)
 */
function sortByPriority(notifications) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  const currentTime = Date.now();

  // Create a copy with scores
  const scoredNotifications = notifications.map((notification) => ({
    ...notification,
    _priorityScore: calculatePriorityScore(notification, currentTime)
  }));

  // Sort by priority score (descending)
  return scoredNotifications.sort((a, b) => b._priorityScore - a._priorityScore);
}

/**
 * Gets top N priority notifications
 * 
 * @param {array} notifications - Array of notification objects
 * @param {number} limit - Maximum number of notifications to return
 * @returns {object} - Object with sorted notifications and metadata
 */
async function getTopPriorityNotifications(notifications, limit = 10) {
  try {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      await Log('backend', 'warn', 'service', 'No notifications to prioritize');
      return {
        success: true,
        notifications: [],
        count: 0
      };
    }

    await Log(
      'backend',
      'debug',
      'service',
      `Sorting ${notifications.length} notifications by priority`
    );

    // Keep only unread notifications first. Missing isRead is treated as unread
    // so mock data without this field still appears in the inbox demo.
    const unreadNotifications = filterByReadStatus(notifications, false);

    // Sort unread notifications by priority.
    const sortedNotifications = sortByPriority(unreadNotifications);

    // Take top N
    const topNotifications = sortedNotifications.slice(0, limit);

    await Log(
      'backend',
      'info',
      'service',
      `Returned top ${topNotifications.length} priority notifications`
    );

    // Add priority information for response
    const enrichedNotifications = topNotifications.map((notif, index) => {
      const typePriority = TYPE_PRIORITY[notif.Type] || 0;
      return {
        ...notif,
        priority: typePriority,
        rank: index + 1
      };
    });

    return {
      success: true,
      notifications: enrichedNotifications,
      count: enrichedNotifications.length,
      totalAvailable: notifications.length
    };

  } catch (error) {
    await Log(
      'backend',
      'error',
      'service',
      `Priority ranking failed: ${error.message}`
    );
    throw error;
  }
}

/**
 * Groups notifications by type and returns priority summary
 * 
 * @param {array} notifications - Array of notification objects
 * @returns {object} - Grouped notifications by type
 */
function groupByType(notifications) {
  if (!Array.isArray(notifications)) {
    return {};
  }

  return notifications.reduce((groups, notification) => {
    const type = notification.Type || 'Unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(notification);
    return groups;
  }, {});
}

/**
 * Filters unread notifications only
 * 
 * @param {array} notifications - Array of notification objects
 * @param {boolean} isRead - Whether to filter read or unread (false for unread)
 * @returns {array} - Filtered notifications
 */
function filterByReadStatus(notifications, isRead = false) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter((notification) => {
    // If notification has isRead property, use it
    if ('isRead' in notification) {
      return notification.isRead === isRead;
    }
    // If no isRead property, assume unread
    return !isRead;
  });
}

module.exports = {
  sortByPriority,
  getTopPriorityNotifications,
  groupByType,
  filterByReadStatus,
  calculatePriorityScore,
  TYPE_PRIORITY,
  PRIORITY_LEVELS
};
