/**
 * API Service
 * 
 * Handles communication with external APIs for fetching depot and vehicle data.
 */

const { Log } = require('../../logging_middleware/utils/logger');
const { MOCK_DEPOTS, MOCK_VEHICLES } = require('../utils/mockData');

const EVALUATION_SERVICE_URL = 'http://4.224.186.213/evaluation-service';
const DEPOTS_ENDPOINT = `${EVALUATION_SERVICE_URL}/depots`;
const VEHICLES_ENDPOINT = `${EVALUATION_SERVICE_URL}/vehicles`;
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
 * Fetches depot data from the evaluation service
 * 
 * @returns {Promise<array>} - Array of depot objects
 * @throws {Error} - If API call fails
 */
async function fetchDepots() {
  try {
    await Log('backend', 'debug', 'service', `Fetching depots from ${DEPOTS_ENDPOINT}`);

    const data = await fetchJsonWithTimeout(DEPOTS_ENDPOINT, 'Depots');

    if (!data.depots || !Array.isArray(data.depots)) {
      throw new Error('Invalid depots response format');
    }

    await Log(
      'backend',
      'info',
      'service',
      `Fetched ${data.depots.length} depots from API`
    );

    return {
      depots: data.depots,
      dataSource: 'external'
    };

  } catch (error) {
    if (shouldUseMockData(error)) {
      await Log('backend', 'warn', 'service', `Depots API failed, using mock data: ${error.message}`);

      return {
        depots: MOCK_DEPOTS,
        dataSource: 'mock'
      };
    }

    await Log('backend', 'error', 'service', `Failed to fetch depots: ${error.message}`);

    return {
      depots: MOCK_DEPOTS,
      dataSource: 'mock'
    };
  }
}

/**
 * Fetches vehicle data from the evaluation service
 * 
 * @returns {Promise<array>} - Array of vehicle task objects
 * @throws {Error} - If API call fails
 */
async function fetchVehicles() {
  try {
    await Log('backend', 'debug', 'service', `Fetching vehicles from ${VEHICLES_ENDPOINT}`);

    const data = await fetchJsonWithTimeout(VEHICLES_ENDPOINT, 'Vehicles');

    if (!data.vehicles || !Array.isArray(data.vehicles)) {
      throw new Error('Invalid vehicles response format');
    }

    await Log(
      'backend',
      'info',
      'service',
      `Fetched ${data.vehicles.length} vehicles from API`
    );

    return {
      vehicles: data.vehicles,
      dataSource: 'external'
    };

  } catch (error) {
    if (shouldUseMockData(error)) {
      await Log('backend', 'warn', 'service', `Vehicles API failed, using mock data: ${error.message}`);

      return {
        vehicles: MOCK_VEHICLES,
        dataSource: 'mock'
      };
    }

    await Log('backend', 'error', 'service', `Failed to fetch vehicles: ${error.message}`);

    return {
      vehicles: MOCK_VEHICLES,
      dataSource: 'mock'
    };
  }
}

/**
 * Finds a specific depot by ID
 * 
 * @param {array} depots - Array of depot objects
 * @param {number} depotId - ID to search for
 * @returns {object|null} - Depot object or null if not found
 */
function findDepotById(depots, depotId) {
  return depots.find(depot => depot.ID === depotId) || null;
}

module.exports = {
  fetchDepots,
  fetchVehicles,
  findDepotById,
  shouldUseMockData
};
