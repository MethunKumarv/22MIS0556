/**
 * Demo User Controller
 *
 * This endpoint is only for Postman screenshots and interview demonstrations.
 * It does not persist data and always returns a JSON response.
 */

const { Log } = require('../../logging_middleware/utils/logger');

let nextUserId = 1;

async function createUser(req, res) {
  try {
    await Log('backend', 'info', 'controller', 'POST /users called');

    const { name } = req.body || {};

    if (typeof name !== 'string' || name.trim().length === 0) {
      await Log('backend', 'warn', 'controller', 'Invalid user payload received');

      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const user = {
      id: nextUserId++,
      name: name.trim()
    };

    return res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    await Log('backend', 'error', 'controller', `Create user failed: ${error.message}`);

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = {
  createUser
};