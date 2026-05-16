# Setup and Testing Guide

Complete guide for setting up and testing all three microservices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running Services](#running-services)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 14.0.0 or higher
- **npm** (comes with Node.js)
- **Git** (optional, for version control)
- **Postman** or **cURL** (for testing)
- **Text Editor** or IDE (VS Code recommended)

### Verify Installation

```bash
node --version    # Should be v14.0.0 or higher
npm --version     # Should be 6.0.0 or higher
```

---

## Installation

### 1. Clone/Download Project

```bash
# Navigate to project directory
cd "d:\VIT SYLLABUS\8th Sem\Affmed"
```

### 2. Install Logging Middleware

```bash
cd logging_middleware
npm install
cd ..
```

**Expected Output:**
```
added X packages in Xs
```

### 3. Install Vehicle Maintenance Scheduler

```bash
cd vehicle_maintence_scheduler
npm install
cd ..
```

### 4. Install Notification App Backend

```bash
cd notification_app_b
npm install
cd ..
```

### All Services Installation Complete ✅

---

## Running Services

### Terminal Setup

You'll need **3 terminal windows**:
- **Terminal 1**: Vehicle Maintenance Scheduler
- **Terminal 2**: Notification App Backend
- **Terminal 3**: Testing/curl commands

### Start Vehicle Maintenance Scheduler

```bash
# Terminal 1
cd vehicle_maintence_scheduler
npm run dev
```

**Expected Output:**
```
🚀 Vehicle Maintenance Scheduler running on port 3001
📍 Health check: http://localhost:3001/health
📋 Schedule endpoint: http://localhost:3001/schedule/:depotId
```

### Start Notification App Backend

```bash
# Terminal 2
cd notification_app_b
npm run dev
```

**Expected Output:**
```
🔔 Notification App Backend running on port 3002
📍 Health check: http://localhost:3002/health
📬 Top notifications: http://localhost:3002/notifications/top?limit=10
```

### Both Services Running ✅

---

## Testing

### Quick Health Check

```bash
# Terminal 3
curl http://localhost:3001/health
curl http://localhost:3002/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server running"
}
```

---

### Vehicle Maintenance Scheduler Tests

#### Test 1: Generate Schedule for Depot 1

```bash
curl http://localhost:3001/schedule/1
```

**Expected Response (200):**
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

#### Test 2: Invalid Depot ID

```bash
curl http://localhost:3001/schedule/invalid
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Depot ID must be a positive integer"
}
```

#### Test 3: Depot Not Found

```bash
curl http://localhost:3001/schedule/999
```

**Expected Response (404):**
```json
{
  "success": false,
  "error": "Depot with ID 999 not found"
}
```

---

### Notification App Backend Tests

#### Test 1: Get Top 10 Notifications

```bash
curl "http://localhost:3002/notifications/top?limit=10"
```

**Expected Response (200):**
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
    }
  ]
}
```

#### Test 2: Get Top 5 Notifications

```bash
curl "http://localhost:3002/notifications/top?limit=5"
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 5,
  "limit": 5,
  "notifications": [...]
}
```

#### Test 3: Invalid Limit

```bash
curl "http://localhost:3002/notifications/top?limit=-5"
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Limit must be a positive integer"
}
```

#### Test 4: Limit Auto-cap

```bash
curl "http://localhost:3002/notifications/top?limit=200"
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 100,  # Capped at 100
  "limit": 100,
  "notifications": [...]
}
```

---

### Automated Testing Script

#### Using cURL Script (Linux/Mac)

```bash
# Make script executable
chmod +x CURL_EXAMPLES.sh

# Run all tests
./CURL_EXAMPLES.sh
```

#### Using cURL Script (Windows)

```bash
# Convert and run
bash CURL_EXAMPLES.sh
```

---

### Using Postman

#### Import Collection

1. Open Postman
2. Click **Import**
3. Select **POSTMAN_COLLECTION.json**
4. Click **Import**

#### Run Tests

1. Select **Campus Backend Assignment** collection
2. Click **Runner**
3. Select collection and click **Start Test Run**
4. Review results

---

## Testing Checklist

### Vehicle Maintenance Scheduler

- [ ] Health check returns 200
- [ ] Schedule for existing depot returns 200 with tasks
- [ ] Invalid depot ID returns 400
- [ ] Non-existent depot returns 404
- [ ] Response includes all required fields
- [ ] Knapsack algorithm works correctly
- [ ] Logging is working

### Notification App Backend

- [ ] Health check returns 200
- [ ] Top notifications endpoint returns 200
- [ ] Default limit works (returns 10)
- [ ] Custom limit works (1-100)
- [ ] Limit over 100 auto-caps to 100
- [ ] Invalid limit returns 400
- [ ] Notifications sorted by priority
- [ ] Placement notifications appear first
- [ ] Logging is working

### Logging Middleware

- [ ] Both services can import logger
- [ ] Log function accepts valid parameters
- [ ] Invalid parameters are rejected
- [ ] Logs appear in console

---

## Expected Behavior

### Knapsack Algorithm

**Given:**
- Mechanic hours: 60
- Tasks with duration and impact

**Should:**
- Return tasks that maximize impact
- Not exceed mechanic hours
- Include highest impact tasks first

### Priority Ranking

**Order:**
1. Placement notifications (newest first)
2. Result notifications (newest first)
3. Event notifications (newest first)

**Example:**
- Placement from 5 min ago → Rank 1
- Placement from 30 min ago → Rank 2
- Result from 10 min ago → Rank 3
- Event from 2 min ago → Rank 4

---

## Performance Expectations

### Response Times

- Health check: < 50ms
- Schedule generation: < 500ms
- Top notifications: < 200ms

### Throughput

- Vehicle scheduler: 100+ requests/second
- Notification app: 200+ requests/second

---

## Common Issues & Solutions

### Issue: Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Option 1: Use different port
PORT=3003 npm run dev

# Option 2: Kill existing process
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Issue: External API Unreachable

**Problem:** API returns connection errors

**Solution:**
```bash
# Check if evaluation service is running
curl http://4.224.186.213/evaluation-service/

# If not available, verify IP and port
# Service should be at: http://4.224.186.213/evaluation-service/
```

### Issue: Module Not Found

**Problem:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
cd <service-directory>
rm -rf node_modules package-lock.json
npm install
```

### Issue: Permission Denied (Linux/Mac)

**Problem:** `permission denied` when running script

**Solution:**
```bash
chmod +x CURL_EXAMPLES.sh
./CURL_EXAMPLES.sh
```

### Issue: No Notifications Returned

**Problem:** Empty notifications array

**Solution:**
- Verify external API is running
- Check network connectivity
- Review logs for errors
- Test with different limit values

---

## Debugging

### Enable Verbose Logging

```bash
# Terminal
DEBUG=* npm run dev
```

### Check Logs

All services log to console with timestamps:
```
[2026-04-22T17:51:18Z] GET /schedule/1
[2026-04-22T17:51:18Z] Knapsack completed: 5 tasks selected
```

### Test with Verbose cURL

```bash
curl -v http://localhost:3001/schedule/1
```

Shows:
- Request headers
- Response headers
- Response body
- Timing information

### Use Postman Console

1. Open Postman
2. View → Show Postman Console
3. See request/response details

---

## Next Steps

### After Successful Testing

1. Review code in each service
2. Study the knapsack algorithm implementation
3. Analyze priority ranking logic
4. Review logging middleware
5. Check notification system design document

### Potential Improvements

- Add database persistence
- Implement caching with Redis
- Add WebSocket support
- Implement queue system
- Add authentication/authorization
- Add rate limiting
- Add monitoring/metrics

---

## Integration Testing

### Test Data Flow

```
Vehicle Scheduler:
1. Request → /schedule/1
2. Fetch depots from external API
3. Fetch vehicles from external API
4. Run knapsack algorithm
5. Return optimal selection

Notification App:
1. Request → /notifications/top?limit=10
2. Fetch notifications from external API
3. Sort by priority algorithm
4. Return top 10
```

### End-to-End Test

```bash
# Terminal 1
npm run dev  # Start vehicle scheduler

# Terminal 2
npm run dev  # Start notification app

# Terminal 3
# Test both together
curl http://localhost:3001/health && curl http://localhost:3002/health
```

---

## Monitoring

### Check Service Status

```bash
# Quick check
curl -s http://localhost:3001/health && echo "✅ Vehicle Scheduler OK"
curl -s http://localhost:3002/health && echo "✅ Notification App OK"
```

### View Logs

- Both services log to stdout
- Check terminal windows for output
- Timestamps help track requests

### Metrics to Track

- Response times
- Error rates
- API call counts
- Data processing times

---

## Security Testing

### Test Input Validation

```bash
# SQL injection attempt (should be ignored)
curl "http://localhost:3001/schedule/1 OR 1=1"

# XSS attempt (should be sanitized)
curl "http://localhost:3002/notifications/top?limit=<script>alert('xss')</script>"

# Large payload (should be rejected)
curl -X GET "http://localhost:3002/notifications/top?limit=999999999999999999"
```

---

## Load Testing

### Simple Load Test

```bash
# Install Apache Bench (if not present)
# Mac: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Test 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:3001/health
```

### Results

```
Requests per second: X
Time per request: Xms
Failed requests: 0
```

---

## Documentation References

- [Logging Middleware README](logging_middleware/README.md)
- [Vehicle Maintenance Scheduler README](vehicle_maintence_scheduler/README.md)
- [Notification App Backend README](notification_app_b/README.md)
- [Notification System Design](notification_system_design.md)
- [Main README](README.md)

---

## Support

For issues:
1. Check troubleshooting section
2. Review service-specific README
3. Check logs for error messages
4. Verify external APIs are accessible

---

**Happy Testing! ✅**
