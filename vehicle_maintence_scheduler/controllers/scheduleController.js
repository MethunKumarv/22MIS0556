/**
 * Schedule Controller
 * 
 * Handles the schedule-related HTTP requests.
 */

const { Log } = require('../../logging_middleware/utils/logger');
const { generateSchedule } = require('../services/scheduleService');

/**
 * GET /schedule/:depotId
 * 
 * Generates optimal schedule for a specific depot
 */
async function getSchedule(req, res) {
  try {
    const { depotId } = req.params;

    await Log('backend', 'info', 'controller', `Schedule requested for depot: ${depotId}`);

    // Validate depotId
    const id = parseInt(depotId, 10);
    if (isNaN(id) || id <= 0) {
      await Log('backend', 'warn', 'controller', `Invalid depot ID format: ${depotId}`);

      return res.status(400).json({
        success: false,
        error: 'Depot ID must be a positive integer'
      });
    }

    // Generate schedule
    const result = await generateSchedule(id);

    return res.status(200).json(result);

  } catch (error) {
    await Log('backend', 'error', 'controller', `Schedule controller error: ${error.message}`);

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = {
  getSchedule
};
