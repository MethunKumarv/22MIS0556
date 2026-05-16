# Notification App Backend

A production-grade microservice that delivers intelligent campus notifications with priority inbox functionality. Supports placement, event, and result notifications with sophisticated sorting algorithms.

## Features

- ✅ Priority-based notification ranking
- ✅ Type-based prioritization (Placement > Result > Event)
- ✅ Recency-aware sorting
- ✅ In-code sorting (no database queries)
- ✅ Async/await architecture
- ✅ Clean layered architecture
- ✅ Comprehensive error handling
- ✅ Integrated logging middleware
- ✅ Production-ready code

## Problem Statement

Campus notifications need to be surfaced intelligently. Different notification types have different importance levels:
- **Placement**: Highest priority (time-sensitive, career-impacting)
- **Result**: Medium priority (important for academics)
- **Event**: Lower priority (informational)

Additionally, newer notifications should be ranked higher than older ones within the same type.

This service implements this logic in code without relying on database queries.

## Installation

```bash
npm install
```

## Setup

1. Ensure Node.js 14+ is installed
2. Install dependencies: `npm install`
3. No database setup required (fetches from external API)
4. Update port in environment if needed (default: 3002)

## Running the Service

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server will start on `http://localhost:3002`

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

### 2. Get Top Priority Notifications

**Endpoint:**
```
GET /notifications/top
```

**Query Parameters:**
- `limit` (optional, integer, default: 10): Number of top notifications to return (max: 100)

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "limit": 10,
  "notifications": [
    {
      "ID": "550e8400-e29b-41d4-a716-446655440000",
      "Type": "Placement",
      "Message": "CSX Corporation hiring",
      "Timestamp": "2026-04-22 17:51:18",
      "priority": 3,
      "rank": 1
    },
    {
      "ID": "550e8400-e29b-41d4-a716-446655440001",
      "Type": "Placement",
      "Message": "Google Campus Recruitment",
      "Timestamp": "2026-04-21 10:30:00",
      "priority": 3,
      "rank": 2
    },
    {
      "ID": "550e8400-e29b-41d4-a716-446655440002",
      "Type": "Result",
      "Message": "Semester results published",
      "Timestamp": "2026-04-20 15:45:00",
      "priority": 2,
      "rank": 3
    }
  ]
}
```

**Response (400 - Invalid limit):**
```json
{
  "success": false,
  "error": "Limit must be a positive integer"
}
```

**Response (500 - API Error):**
```json
{
  "success": false,
  "error": "Failed to fetch notifications: connection timeout"
}
```

---

## Architecture

```
notification_app_b/
│
├── routes/
│   └── index.js                    # Route definitions
│
├── controllers/
│   ├── notificationController.js  # Request handlers
│   └── healthController.js        # Health check
│
├── services/
│   ├── notificationService.js     # Orchestration
│   ├── notificationApiService.js  # External API calls
│   └── priorityService.js         # Priority ranking logic
│
├── middleware/
│   └── logging.js                 # Logging middleware
│
├── app.js                         # Main Express app
├── package.json
└── README.md
```

---

## Priority Ranking Algorithm

### Ranking Formula

```
Priority Score = (TypePriority * 1000) + RecencyScore

TypePriority:
  - Placement: 3
  - Result: 2
  - Event: 1

RecencyScore (0-1000):
  - Newer notifications get higher scores
  - Score decreases over time (max 1 day old)
```

### Example Ranking

Given notifications:
1. Placement - 5 minutes ago
2. Placement - 30 minutes ago
3. Result - 10 minutes ago
4. Event - 2 minutes ago

**Ranking:**
1. Placement (5 min) - Score: 3000 + 996 = 3996
2. Placement (30 min) - Score: 3000 + 979 = 3979
3. Result (10 min) - Score: 2000 + 993 = 2993
4. Event (2 min) - Score: 1000 + 998 = 1998

All sorting is done in-code without database queries.

---

## External API

### Fetch Notifications

```
GET http://4.224.186.213/evaluation-service/notifications
```

**Response:**
```json
{
  "notifications": [
    {
      "ID": "uuid",
      "Type": "Placement",
      "Message": "CSX Corporation hiring",
      "Timestamp": "2026-04-22 17:51:18"
    }
  ]
}
```

---

## Logging

The service integrates with the centralized logging middleware. All operations are logged:

```javascript
await Log('backend', 'info', 'route', 'GET /notifications/top called');
await Log('backend', 'error', 'service', 'Failed to fetch notifications');
```

---

## Error Handling

- Input validation for query parameters
- API call error handling
- Graceful degradation
- Centralized error middleware
- Proper HTTP status codes

---

## Example Requests

### cURL

```bash
# Health check
curl http://localhost:3002/health

# Get top 10 notifications
curl http://localhost:3002/notifications/top?limit=10

# Get top 5 notifications
curl http://localhost:3002/notifications/top?limit=5
```

### Postman

**Health Check**
- Method: GET
- URL: `http://localhost:3002/health`

**Get Top Notifications**
- Method: GET
- URL: `http://localhost:3002/notifications/top`
- Query Params: `limit=10`

---

## Testing the API

```bash
# Start the server
npm run dev

# In another terminal, test endpoints
curl http://localhost:3002/health

curl "http://localhost:3002/notifications/top?limit=10"
```

## Performance Characteristics

- **Time Complexity:** O(n log n) for sorting n notifications
- **Space Complexity:** O(n) for storing notifications
- **No database queries:** All operations in-memory
- **Scalability:** Suitable for 10,000+ notifications

## Environment Variables

Optional:
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment mode (default: development)

## Troubleshooting

### Port already in use
```bash
# Change port
PORT=3003 npm run dev
```

### External API unreachable
Check if the evaluation service is running at:
- `http://4.224.186.213/evaluation-service/notifications`

### Invalid limit parameter
Limit must be a positive integer between 1 and 100.

## Development

The codebase follows these principles:
- Clean code with meaningful comments
- Separation of concerns
- Async/await for non-blocking operations
- Comprehensive error handling
- Centralized logging

## Dependencies

- **express**: Web framework (^4.18.2)

No external algorithm libraries used. All prioritization logic implemented from scratch.

## Integration with Other Services

### Logging Middleware

```javascript
const { Log } = require('../../../logging_middleware/utils/logger');

await Log('backend', 'info', 'service', 'Processing notifications');
```

### Notification System Design

For detailed system design documentation, see:
- [notification_system_design.md](../notification_system_design.md)

### Vehicle Maintenance Scheduler

Separate microservice at:
- [vehicle_maintence_scheduler](../vehicle_maintence_scheduler)

---

## License

ISC

## Support

For issues or improvements, contact the development team.
