# Vehicle Maintenance Scheduler

A production-grade microservice that solves the vehicle maintenance scheduling problem using the 0/1 Knapsack algorithm. This service optimizes task selection to maximize maintenance impact while respecting available mechanic hours.

## Features

- ✅ 0/1 Knapsack algorithm implementation (no external libraries)
- ✅ Async/await based architecture
- ✅ Clean layered architecture (routes → controllers → services)
- ✅ Comprehensive error handling
- ✅ Integrated logging middleware
- ✅ Proper HTTP status codes
- ✅ External API integration
- ✅ Production-ready code

## Problem Statement

A depot has limited mechanic hours. Given a set of vehicle maintenance tasks, each with:
- `TaskID`: Unique identifier
- `Duration`: Hours required to complete
- `Impact`: Value/importance of completing the task

**Objective**: Select tasks that maximize total impact while staying within total mechanic hours.

This is a classic **0/1 Knapsack Problem**.

## Installation

```bash
npm install
```

## Setup

1. Ensure Node.js 14+ is installed
2. Install dependencies: `npm install`
3. No database setup required (uses external APIs)
4. Update port in `.env` if needed (default: 3001)

## Running the Service

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### 1. Health Check

**Endpoint:**
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server running"
}
```

**Status:** 200

---

### 2. Generate Optimal Schedule

**Endpoint:**
```
GET /schedule/:depotId
```

**Parameters:**
- `depotId` (path): Positive integer ID of the depot

**Response:**
```json
{
  "success": true,
  "depotId": 1,
  "mechanicHours": 60,
  "totalDuration": 58,
  "totalImpact": 145,
  "selectedTasks": [
    {
      "taskId": "uuid",
      "duration": 5,
      "impact": 10
    }
  ],
  "metrics": {
    "utilizationRate": 0.97,
    "taskCount": 5,
    "maxPossibleImpact": 145
  }
}
```

**Status:** 200 if depot found, 404 if not found

---

## Architecture

```
vehicle_maintenance_scheduler/
│
├── routes/
│   └── index.js              # Route definitions
│
├── controllers/
│   ├── scheduleController.js # Request handlers
│   └── healthController.js   # Health check handler
│
├── services/
│   ├── scheduleService.js    # Orchestration logic
│   ├── apiService.js         # External API calls
│   └── knapsackService.js    # Knapsack algorithm
│
├── middleware/
│   └── logging.js            # Logging middleware
│
├── app.js                    # Main Express app
├── package.json
└── README.md
```

## Algorithm Details

### 0/1 Knapsack Algorithm

**Time Complexity:** O(n × W)
- n = number of vehicles/tasks
- W = mechanic hours (capacity)

**Space Complexity:** O(n × W)

**How it works:**

1. Create a 2D DP table where `dp[i][w]` = maximum impact using first i items with capacity w
2. For each item, decide whether to include it based on:
   - If duration ≤ remaining capacity: include if it increases total impact
   - Otherwise: skip it
3. Backtrack through the DP table to find which tasks were selected
4. Return selected tasks and calculate total duration and impact

**Example:**

Given:
- Mechanic hours: 60
- Tasks:
  - Task 1: Duration 5, Impact 10
  - Task 2: Duration 10, Impact 20
  - Task 3: Duration 15, Impact 30

Optimal selection: Tasks 2 and 3
- Total duration: 25 hours
- Total impact: 50

## External APIs

### Fetch Depots

```
GET http://4.224.186.213/evaluation-service/depots
```

**Response:**
```json
{
  "depots": [
    {
      "ID": 1,
      "MechanicHours": 60
    }
  ]
}
```

### Fetch Vehicles

```
GET http://4.224.186.213/evaluation-service/vehicles
```

**Response:**
```json
{
  "vehicles": [
    {
      "TaskID": "uuid",
      "Duration": 5,
      "Impact": 10
    }
  ]
}
```

## Logging

The service integrates with the centralized logging middleware. All operations are logged with appropriate severity levels:

```javascript
await Log('backend', 'info', 'route', 'GET /schedule/1 called');
await Log('backend', 'error', 'service', 'Failed to fetch depots');
```

## Error Handling

- Input validation for all parameters
- Graceful handling of missing depots/vehicles
- Network error handling for API calls
- Centralized error middleware
- Proper HTTP status codes

## Example Requests

### cURL

```bash
# Health check
curl http://localhost:3001/health

# Generate schedule for depot 1
curl http://localhost:3001/schedule/1

# Generate schedule for depot 5
curl http://localhost:3001/schedule/5
```

### Postman

**Health Check**
- Method: GET
- URL: `http://localhost:3001/health`

**Generate Schedule**
- Method: GET
- URL: `http://localhost:3001/schedule/:depotId`
- URL example: `http://localhost:3001/schedule/1`

## Testing the API

```bash
# Start the server
npm run dev

# In another terminal, test endpoints
curl http://localhost:3001/health

curl http://localhost:3001/schedule/1
```

## Performance Considerations

- No database queries (uses external APIs)
- No data persistence (stateless service)
- Single API call per schedule generation
- Efficient knapsack algorithm: O(n × W)

## Environment Variables

Optional:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (default: development)

## Troubleshooting

### Port already in use
```bash
# Change port
PORT=3002 npm run dev
```

### External API unreachable
Check if the evaluation service is running at:
- `http://4.224.186.213/evaluation-service/`

### Invalid depot ID
Ensure the depot ID exists in the system. Use a positive integer.

## Development

The codebase follows these principles:
- Clean code and meaningful comments
- Separation of concerns (routes → controllers → services)
- Async/await for non-blocking operations
- Error handling at every layer
- Comprehensive logging

## Dependencies

- **express**: Web framework (^4.18.2)

No external algorithm libraries used. The knapsack algorithm is implemented from scratch.

## License

ISC

## Support

For issues or improvements, contact the development team.
