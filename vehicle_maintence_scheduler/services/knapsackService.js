/**
 * Vehicle Maintenance Scheduler Service
 * 
 * This service implements the 0/1 Knapsack algorithm to solve the vehicle
 * maintenance scheduling problem. It finds the optimal set of tasks that
 * maximize impact while staying within mechanic hours constraint.
 * 
 * Algorithm Complexity:
 * - Time: O(n * W) where n is number of vehicles and W is mechanic hours
 * - Space: O(n * W)
 */

const { Log } = require('../../logging_middleware/utils/logger');

/**
 * Solves the 0/1 Knapsack problem for vehicle maintenance scheduling
 * 
 * @param {array} vehicles - Array of vehicle tasks with Duration and Impact
 * @param {number} mechanicHours - Total available mechanic hours (capacity)
 * @returns {object} - Result with selected tasks and metrics
 */
async function solveKnapsack(vehicles, mechanicHours) {
  try {
    await Log('backend', 'debug', 'service', 'Starting knapsack algorithm');

    // Validate inputs
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      await Log('backend', 'warn', 'service', 'No vehicles provided to schedule');
      return {
        success: true,
        selectedTasks: [],
        totalDuration: 0,
        totalImpact: 0,
        metrics: {
          utilizationRate: 0,
          taskCount: 0
        }
      };
    }

    if (!Number.isInteger(mechanicHours) || mechanicHours <= 0) {
      await Log('backend', 'error', 'service', `Invalid mechanic hours: ${mechanicHours}`);
      throw new Error('Mechanic hours must be a positive integer');
    }

    const n = vehicles.length;
    const W = mechanicHours;

    // Create DP table: dp[i][w] represents max impact using first i items with capacity w
    const dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));

    // Fill the DP table
    for (let i = 1; i <= n; i++) {
      const currentVehicle = vehicles[i - 1];
      const duration = currentVehicle.Duration;
      const impact = currentVehicle.Impact;

      for (let w = 0; w <= W; w++) {
        // Option 1: Don't include current vehicle
        dp[i][w] = dp[i - 1][w];

        // Option 2: Include current vehicle (if it fits)
        if (duration <= w) {
          const newImpact = dp[i - 1][w - duration] + impact;
          dp[i][w] = Math.max(dp[i][w], newImpact);
        }
      }
    }

    // Backtrack to find which tasks were selected
    const selectedTasks = [];
    let currentCapacity = W;

    for (let i = n; i > 0 && currentCapacity > 0; i--) {
      // Check if this item was included in the optimal solution
      if (dp[i][currentCapacity] !== dp[i - 1][currentCapacity]) {
        const vehicle = vehicles[i - 1];
        selectedTasks.unshift({
          taskId: vehicle.TaskID,
          duration: vehicle.Duration,
          impact: vehicle.Impact
        });
        currentCapacity -= vehicle.Duration;
      }
    }

    // Calculate totals
    const totalDuration = selectedTasks.reduce((sum, task) => sum + task.duration, 0);
    const totalImpact = selectedTasks.reduce((sum, task) => sum + task.impact, 0);
    const utilizationRate = totalDuration / mechanicHours;

    await Log(
      'backend',
      'info',
      'service',
      `Knapsack completed: ${selectedTasks.length} tasks selected, ${totalImpact} total impact`
    );

    return {
      success: true,
      selectedTasks,
      totalDuration,
      totalImpact,
      metrics: {
        utilizationRate: parseFloat(utilizationRate.toFixed(2)),
        taskCount: selectedTasks.length,
        maxPossibleImpact: dp[n][W]
      }
    };

  } catch (error) {
    await Log('backend', 'error', 'service', `Knapsack algorithm failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  solveKnapsack
};
