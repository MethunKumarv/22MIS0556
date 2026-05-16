/**
 * Fallback mock data used when the external evaluation APIs are unavailable.
 * This keeps the scheduler demo working in Postman even when protected routes
 * return 401/403 or the network request fails.
 */

const MOCK_DEPOTS = [
  {
    ID: 1,
    MechanicHours: 10
  }
];

const MOCK_VEHICLES = [
  {
    TaskID: 'A',
    Duration: 5,
    Impact: 10
  },
  {
    TaskID: 'B',
    Duration: 4,
    Impact: 7
  },
  {
    TaskID: 'C',
    Duration: 2,
    Impact: 4
  }
];

module.exports = {
  MOCK_DEPOTS,
  MOCK_VEHICLES
};