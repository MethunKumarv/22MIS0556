/**
 * Health Controller
 * 
 * Handles health check requests.
 */

const { Log } = require('../../logging_middleware/utils/logger');

/**
 * GET /health
 * 
 * Returns server health status
 */
async function healthCheck(req, res) {
  try {
    await Log('backend', 'debug', 'controller', 'Health check requested');

    res.status(200).json({
      success: true,
      message: 'Server running'
    });

  } catch (error) {
    await Log('backend', 'error', 'controller', `Health check error: ${error.message}`);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

module.exports = {
  healthCheck
};
