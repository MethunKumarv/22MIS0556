/**
 * Schedule Service
 * 
 * Orchestrates the scheduling logic by fetching data from APIs and running the knapsack algorithm.
 */

const { Log } = require('../../logging_middleware/utils/logger');
const { fetchDepots, fetchVehicles, findDepotById } = require('./apiService');
const { solveKnapsack } = require('./knapsackService');
const { MOCK_DEPOTS } = require('../utils/mockData');

/**
 * Generates optimal schedule for a given depot
 * 
 * @param {number} depotId - The depot ID to generate schedule for
 * @returns {Promise<object>} - Schedule result with selected tasks
 */
async function generateSchedule(depotId) {
  try {
    await Log(
      'backend',
      'info',
      'service',
      `Generating schedule for depot ${depotId}`
    );

    // Fetch data from APIs
    const [depotResult, vehicleResult] = await Promise.all([
      fetchDepots(),
      fetchVehicles()
    ]);

    const depots = depotResult.depots;
    const vehicles = vehicleResult.vehicles;
    const dataSource = depotResult.dataSource === 'mock' || vehicleResult.dataSource === 'mock'
      ? 'mock'
      : 'external';

    // Find the specific depot
    const depot = findDepotById(depots, depotId);
    const effectiveDepot = depot || findDepotById(MOCK_DEPOTS, depotId);

    if (!effectiveDepot) {
      await Log('backend', 'error', 'service', `Depot ${depotId} not found in external or mock data`);

      return {
        success: true,
        dataSource,
        depotId,
        mechanicHours: 0,
        totalDuration: 0,
        totalImpact: 0,
        selectedTasks: []
      };
    }

    await Log(
      'backend',
      'debug',
      'service',
      `Found depot ${depotId} with ${effectiveDepot.MechanicHours} mechanic hours`
    );

    // Validate vehicle data
    if (!vehicles || vehicles.length === 0) {
      await Log(
        'backend',
        'warn',
        'service',
        'No vehicles available for scheduling'
      );

      return {
        success: true,
        dataSource,
        depotId: effectiveDepot.ID,
        mechanicHours: effectiveDepot.MechanicHours,
        totalDuration: 0,
        totalImpact: 0,
        selectedTasks: []
      };
    }

    // Run the knapsack algorithm against either external or fallback data.
    const knapsackResult = await solveKnapsack(vehicles, effectiveDepot.MechanicHours);

    if (!knapsackResult.success) {
      return {
        success: false,
        error: 'Failed to solve knapsack problem'
      };
    }

    await Log(
      'backend',
      'info',
      'service',
      `Schedule generated: ${knapsackResult.selectedTasks.length} tasks, impact: ${knapsackResult.totalImpact}`
    );

    // Return formatted response
    return {
      success: true,
      dataSource,
      depotId: effectiveDepot.ID,
      mechanicHours: effectiveDepot.MechanicHours,
      totalDuration: knapsackResult.totalDuration,
      totalImpact: knapsackResult.totalImpact,
      selectedTasks: knapsackResult.selectedTasks,
      metrics: knapsackResult.metrics
    };

  } catch (error) {
    await Log(
      'backend',
      'error',
      'service',
      `Schedule generation failed: ${error.message}`
    );

    return {
      success: false,
      error: `Failed to generate schedule: ${error.message}`
    };
  }
}

module.exports = {
  generateSchedule
};
