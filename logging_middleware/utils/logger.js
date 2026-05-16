/**
 * Reusable Logger Module
 * 
 * This module provides a centralized logging function that sends logs to the evaluation service.
 * It validates all input parameters and handles errors gracefully.
 * 
 * Usage:
 * const { Log } = require('./logger');
 * await Log('backend', 'info', 'service', 'Operation completed successfully');
 */

// Allowed values for validation
const ALLOWED_STACKS = ['backend', 'frontend'];

const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const ALLOWED_BACKEND_PACKAGES = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service'
];

const ALLOWED_SHARED_PACKAGES = [
  'auth',
  'config',
  'middleware',
  'utils'
];

const EVALUATION_SERVICE_URL = 'http://4.224.186.213/evaluation-service/logs';

/**
 * Validates if a value is in the allowed set
 * 
 * @param {string} value - The value to validate
 * @param {array} allowedValues - Array of allowed values
 * @param {string} fieldName - Name of the field for error messages
 * @returns {object} - { isValid: boolean, error: string }
 */
function validateValue(value, allowedValues, fieldName) {
  if (!value) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }

  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} must be a string, received ${typeof value}`
    };
  }

  if (!allowedValues.includes(value.toLowerCase())) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}, received "${value}"`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates package name based on stack type
 * 
 * @param {string} stack - The stack type (backend/frontend)
 * @param {string} packageName - The package name
 * @returns {object} - { isValid: boolean, error: string }
 */
function validatePackage(stack, packageName) {
  if (!packageName) {
    return {
      isValid: false,
      error: 'Package is required'
    };
  }

  if (typeof packageName !== 'string') {
    return {
      isValid: false,
      error: `Package must be a string, received ${typeof packageName}`
    };
  }

  if (stack === 'backend') {
    const validBackend = [...ALLOWED_BACKEND_PACKAGES, ...ALLOWED_SHARED_PACKAGES];
    if (!validBackend.includes(packageName.toLowerCase())) {
      return {
        isValid: false,
        error: `For backend stack, package must be one of: ${validBackend.join(', ')}, received "${packageName}"`
      };
    }
  } else if (stack === 'frontend') {
    if (!ALLOWED_SHARED_PACKAGES.includes(packageName.toLowerCase())) {
      return {
        isValid: false,
        error: `For frontend stack, package must be one of: ${ALLOWED_SHARED_PACKAGES.join(', ')}, received "${packageName}"`
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Validates the message parameter
 * 
 * @param {string} message - The log message
 * @returns {object} - { isValid: boolean, error: string }
 */
function validateMessage(message) {
  if (message === undefined || message === null) {
    return {
      isValid: false,
      error: 'Message is required'
    };
  }

  if (typeof message !== 'string') {
    return {
      isValid: false,
      error: `Message must be a string, received ${typeof message}`
    };
  }

  if (message.trim().length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Main logging function
 * 
 * Sends a structured log entry to the evaluation service API.
 * Validates all input parameters before sending.
 * 
 * @param {string} stack - Either 'backend' or 'frontend'
 * @param {string} level - One of 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} packageName - Package name (varies by stack type)
 * @param {string} message - Log message text
 * 
 * @returns {Promise<object>} - API response or error object
 * 
 * @example
 * await Log('backend', 'error', 'service', 'Database connection failed');
 * await Log('backend', 'info', 'route', 'GET /schedule/1 called');
 */
async function Log(stack, level, packageName, message) {
  try {
    // Validate all parameters
    const stackValidation = validateValue(
      stack,
      ALLOWED_STACKS,
      'Stack'
    );
    if (!stackValidation.isValid) {
      return {
        success: false,
        error: stackValidation.error
      };
    }

    const levelValidation = validateValue(
      level,
      ALLOWED_LEVELS,
      'Level'
    );
    if (!levelValidation.isValid) {
      return {
        success: false,
        error: levelValidation.error
      };
    }

    const packageValidation = validatePackage(stack, packageName);
    if (!packageValidation.isValid) {
      return {
        success: false,
        error: packageValidation.error
      };
    }

    const messageValidation = validateMessage(message);
    if (!messageValidation.isValid) {
      return {
        success: false,
        error: messageValidation.error
      };
    }

    // Prepare the request body
    const requestBody = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message: message
    };

    // Send POST request to evaluation service
    const response = await fetch(EVALUATION_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Check if response is ok (status 200-299)
    if (!response.ok) {
      if (response.status !== 401 && response.status !== 403) {
        console.error(
          `Log service returned status ${response.status}: ${response.statusText}`
        );
      }

      return {
        success: false,
        error: `API returned status ${response.status}`,
        status: response.status
      };
    }

    // Parse and return API response
    const data = await response.json();
    return {
      success: true,
      data: data
    };

  } catch (error) {
    // Handle network or parsing errors
    console.error('Logger error:', error.message);
    return {
      success: false,
      error: `Failed to send log: ${error.message}`,
      originalError: error.message
    };
  }
}

module.exports = {
  Log,
  ALLOWED_STACKS,
  ALLOWED_LEVELS,
  ALLOWED_BACKEND_PACKAGES,
  ALLOWED_SHARED_PACKAGES
};
