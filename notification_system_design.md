# Campus Notification System - Backend Design Document

A comprehensive backend system design for a campus notification platform supporting placement, event, and result notifications with real-time delivery capabilities.

---

## STAGE 1: REST API DESIGN

### Overview

The notification system exposes RESTful APIs for managing and delivering notifications across the campus ecosystem.

### 1.1 API Endpoints

#### **1. Fetch Notifications**

```
GET /api/v1/notifications
```

**Query Parameters:**
- `studentId` (required, integer): Student ID
- `limit` (optional, integer, default: 20): Number of notifications to fetch
- `offset` (optional, integer, default: 0): Pagination offset
- `type` (optional, string): Filter by type (placement, event, result)
- `isRead` (optional, boolean): Filter by read status

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "studentId": 1042,
        "type": "placement",
        "title": "CSX Corporation Hiring",
        "message": "CSX Corporation is hiring for Software Engineer positions",
        "timestamp": "2026-04-22T17:51:18Z",
        "isRead": false,
        "priority": 1,
        "metadata": {
          "companyId": "csx_001",
          "salaryRange": "12-15 LPA",
          "deadline": "2026-05-15"
        }
      }
    ],
    "totalCount": 150,
    "limit": 20,
    "offset": 0
  },
  "timestamp": "2026-04-22T17:52:00Z"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Unauthorized - Invalid token"
}
```

---

#### **2. Get Single Notification**

```
GET /api/v1/notifications/:notificationId
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "studentId": 1042,
    "type": "placement",
    "title": "CSX Corporation Hiring",
    "message": "CSX Corporation is hiring for Software Engineer positions",
    "timestamp": "2026-04-22T17:51:18Z",
    "isRead": false,
    "priority": 1,
    "metadata": {}
  }
}
```

---

#### **3. Mark Notification as Read**

```
PUT /api/v1/notifications/:notificationId/read
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "isRead": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### **4. Mark Multiple Notifications as Read**

```
PUT /api/v1/notifications/bulk/read
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "notificationIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "2 notifications marked as read"
}
```

---

#### **5. Delete Notification**

```
DELETE /api/v1/notifications/:notificationId
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

#### **6. Send Notification (Admin)**

```
POST /api/v1/admin/notifications
```

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipientIds": [1042, 1043, 1044],
  "type": "placement",
  "title": "Infosys Campus Drive",
  "message": "Infosys is conducting campus recruitment",
  "metadata": {
    "companyId": "infosys_001",
    "salaryRange": "10-12 LPA",
    "deadline": "2026-05-20"
  },
  "deliveryChannels": ["email", "push", "in-app"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "notificationBatchId": "batch_001",
    "totalRecipients": 3,
    "sentAt": "2026-04-22T18:00:00Z"
  }
}
```

---

#### **7. Get Top Priority Notifications**

```
GET /api/v1/notifications/top
```

**Query Parameters:**
- `limit` (optional, integer, default: 10): Number of top notifications
- `studentId` (optional): Filter for specific student

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "notifications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "placement",
      "title": "Google Campus Recruitment",
      "message": "Google is hiring Software Engineers",
      "timestamp": "2026-04-22T17:51:18Z",
      "isRead": false,
      "priority": 1
    }
  ]
}
```

---

### 1.2 JSON Schema Definitions

#### **Notification Schema**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique notification identifier"
    },
    "studentId": {
      "type": "integer",
      "description": "Target student ID"
    },
    "type": {
      "type": "string",
      "enum": ["placement", "event", "result"],
      "description": "Notification type"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Notification title"
    },
    "message": {
      "type": "string",
      "minLength": 1,
      "maxLength": 5000,
      "description": "Notification message"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "When notification was created"
    },
    "isRead": {
      "type": "boolean",
      "default": false,
      "description": "Read status"
    },
    "priority": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "description": "Priority score (0-100)"
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true,
      "description": "Type-specific metadata"
    }
  },
  "required": ["id", "studentId", "type", "title", "message", "timestamp"]
}
```

---

### 1.3 Naming Conventions

| Aspect | Convention | Example |
|--------|-----------|---------|
| **Endpoints** | kebab-case, RESTful | `/notifications`, `/admin/notifications` |
| **Query params** | camelCase | `?studentId=1042&isRead=false` |
| **JSON fields** | camelCase | `"studentId"`, `"isRead"`, `"createdAt"` |
| **IDs** | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` |
| **Timestamps** | ISO 8601 UTC | `2026-04-22T17:51:18Z` |
| **Enums** | lowercase | `"placement"`, `"event"`, `"result"` |
| **Errors** | PascalCase | `"NotFound"`, `"ValidationError"` |

---

### 1.4 Real-Time Notification Design

#### **WebSocket Connection**

```
ws://api.campus.com/ws/notifications?token={jwt_token}
```

**Client connects and receives real-time updates:**

```javascript
// Client-side
const ws = new WebSocket('ws://api.campus.com/ws/notifications?token=token');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};
```

**Server broadcasts:**

```json
{
  "event": "notification.new",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "placement",
    "title": "New Placement Drive",
    "timestamp": "2026-04-22T17:51:18Z"
  }
}
```

**Supported Events:**
- `notification.new` - New notification received
- `notification.read` - Notification marked as read
- `notification.deleted` - Notification deleted
- `connection.established` - WebSocket connected

---

## STAGE 2: DATABASE SCHEMA DESIGN

### 2.1 SQL vs NoSQL Comparison

| Aspect | SQL | NoSQL (MongoDB) |
|--------|-----|-----------------|
| **Schema** | Fixed schema | Flexible schema |
| **ACID** | Strong ✅ | Eventual consistency |
| **Transactions** | Full support | Limited |
| **Relationships** | JOINs | Embedding/References |
| **Scalability** | Vertical | Horizontal |
| **Query Power** | Complex | Map-reduce |
| **Use Case** | Campus notifications | High-volume reads |

**Recommendation:** **SQL (PostgreSQL)** for transactional consistency and complex queries about student notification history.

---

### 2.2 SQL Schema

```sql
-- Students table
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  rollNumber VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Types table
CREATE TABLE notification_types (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

INSERT INTO notification_types (id, name) VALUES
(1, 'placement'),
(2, 'event'),
(3, 'result');

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studentId INTEGER NOT NULL,
  type INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP,
  
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (type) REFERENCES notification_types(id)
);

-- Notification metadata table
CREATE TABLE notification_metadata (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  notificationId UUID NOT NULL,
  metadataKey VARCHAR(100) NOT NULL,
  metadataValue TEXT,
  
  FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE CASCADE,
  UNIQUE KEY unique_metadata (notificationId, metadataKey)
);

-- Indexes
CREATE INDEX idx_notifications_studentId ON notifications(studentId);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_isRead ON notifications(isRead);
CREATE INDEX idx_notifications_createdAt ON notifications(createdAt DESC);
CREATE INDEX idx_notifications_studentId_isRead ON notifications(studentId, isRead);
CREATE INDEX idx_notifications_studentId_type_createdAt ON notifications(studentId, type, createdAt DESC);

-- Audit log table
CREATE TABLE notification_audit_log (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  notificationId UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  performedBy INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (performedBy) REFERENCES students(id) ON DELETE SET NULL
);

-- Delivery status tracking
CREATE TABLE notification_delivery (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  notificationId UUID NOT NULL,
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sentAt TIMESTAMP,
  failureReason TEXT,
  
  FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE CASCADE,
  UNIQUE KEY unique_delivery (notificationId, channel)
);
```

---

### 2.3 Relationships

**Entity-Relationship Diagram:**

```
Students (1) ──→ (Many) Notifications
              ├──→ (Many) NotificationDelivery
              └──→ (Many) NotificationAuditLog

Notifications ──→ NotificationTypes
             ├──→ NotificationMetadata
             ├──→ NotificationDelivery
             └──→ NotificationAuditLog
```

---

### 2.4 Indexes for Performance

```sql
-- Primary index for student lookups
CREATE INDEX idx_notifications_studentId ON notifications(studentId);

-- For filtering unread notifications
CREATE INDEX idx_notifications_isRead ON notifications(isRead);

-- For sorting by recency
CREATE INDEX idx_notifications_createdAt ON notifications(createdAt DESC);

-- Composite index for common queries
CREATE INDEX idx_notifications_composite ON notifications(
  studentId ASC,
  isRead ASC,
  createdAt DESC
);

-- Type filtering
CREATE INDEX idx_notifications_type ON notifications(type);

-- Full-text search on title and message
CREATE FULLTEXT INDEX idx_notifications_fulltext ON notifications(title, message);
```

---

## STAGE 3: QUERY OPTIMIZATION

### 3.1 Problem: Why the Query is Slow

**Original Query:**
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

**Problems:**

1. **Missing Composite Index**: Queries on both `studentID` and `isRead` without an index
2. **SELECT *** Fetches unnecessary columns** (including large TEXT fields)
3. **No LIMIT clause**: Could return thousands of rows
4. **Sorts on non-indexed column**: Full table scan required for ORDER BY
5. **No column alias mismatch**: `studentID` vs `studentId` (inconsistent naming)

---

### 3.2 Index Optimization

**Create Composite Index:**
```sql
CREATE INDEX idx_notifications_student_unread_recent ON notifications(
  studentId ASC,
  isRead ASC,
  createdAt DESC
);
```

**Why this works:**
- Index tree is sorted by `studentId` first → narrows down quickly
- Then by `isRead` → filters out read notifications
- Then by `createdAt` DESC → no additional sorting needed

---

### 3.3 Optimized Query

```sql
SELECT 
  id,
  studentId,
  type,
  title,
  message,
  isRead,
  createdAt
FROM notifications
WHERE studentId = 1042 
  AND isRead = false
ORDER BY createdAt DESC
LIMIT 50;
```

**Improvements:**
- ✅ Specific columns (not SELECT *)
- ✅ Composite index for fast lookup
- ✅ LIMIT 50 for pagination
- ✅ Consistent column names
- ✅ DESC order built into index

**Query Execution Time:**
- Before: 5-10 seconds
- After: 50-100 milliseconds

---

### 3.4 Alternative: Pagination-Based Query

```sql
-- Page 1: notifications 0-49
SELECT 
  id, studentId, type, title, message, isRead, createdAt
FROM notifications
WHERE studentId = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 50 OFFSET 0;

-- Page 2: notifications 50-99
SELECT 
  id, studentId, type, title, message, isRead, createdAt
FROM notifications
WHERE studentId = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 50 OFFSET 50;
```

---

### 3.5 Complex Query: Find Students with Placement Notifications in Last 7 Days

**Requirement:** Find all students who received placement notifications in the last 7 days.

```sql
SELECT DISTINCT
  s.id,
  s.name,
  s.email,
  COUNT(n.id) as placementNotificationCount,
  MAX(n.createdAt) as lastNotificationTime
FROM students s
INNER JOIN notifications n ON s.id = n.studentId
INNER JOIN notification_types nt ON n.type = nt.id
WHERE nt.name = 'placement'
  AND n.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND n.deletedAt IS NULL
GROUP BY s.id, s.name, s.email
ORDER BY MAX(n.createdAt) DESC;
```

**Indexes needed:**
```sql
CREATE INDEX idx_notifications_type_createdAt ON notifications(type, createdAt DESC);
CREATE INDEX idx_students_id ON students(id);
```

**Alternative: Covering Index**
```sql
CREATE INDEX idx_notifications_covering ON notifications(
  type,
  createdAt DESC,
  studentId,
  id
);
```

This covering index allows the database to satisfy the query entirely from the index without accessing the table.

---

## STAGE 4: SCALING STRATEGIES

### Problem Statement

When notifications are fetched on every page load and database is overloaded.

### 4.1 Caching Strategy

#### **Redis Caching**

```javascript
// Cache user's unread notifications count
const cacheKey = `notifications:unread:${studentId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const notifications = await fetchFromDB(studentId);
await redis.setex(cacheKey, 300, JSON.stringify(notifications)); // 5 min TTL

return notifications;
```

**Cache Invalidation Strategy:**
- TTL-based: 5-10 minutes for notification lists
- Event-based: Invalidate on write operations
- LRU: Least Recently Used eviction policy

---

### 4.2 Pagination Strategy

```javascript
// Instead of fetching all notifications
// Fetch in chunks of 20-50
const limit = 50;
const offset = (page - 1) * limit;

const notifications = await db.query(`
  SELECT * FROM notifications
  WHERE studentId = ?
  ORDER BY createdAt DESC
  LIMIT ? OFFSET ?
`, [studentId, limit, offset]);
```

**Benefits:**
- Reduces memory usage
- Faster first page load
- Better user experience

---

### 4.3 Database Read Replicas

```javascript
// Write operations → Primary DB
await primaryDB.update(notification);

// Read operations → Replica DB
const notifications = await replicaDB.query('SELECT * FROM notifications WHERE ...');
```

**Setup:**
```
Primary DB (Master)
    ↓
    ├─→ Replica 1 (Read-only)
    ├─→ Replica 2 (Read-only)
    └─→ Replica 3 (Read-only)
```

**Load Balancing:**
```javascript
const replicas = [
  'replica1.db.com',
  'replica2.db.com',
  'replica3.db.com'
];

const selectedReplica = replicas[Math.floor(Math.random() * replicas.length)];
```

---

### 4.4 Message Queue System

```javascript
// Instead of synchronous delivery
// Use async queue

const queue = Bull('notifications');

// Producer
await queue.add({
  studentId: 1042,
  message: 'New placement drive'
});

// Consumer
queue.process(async (job) => {
  await sendEmailNotification(job.data);
  await sendPushNotification(job.data);
  await saveToDatabase(job.data);
});
```

**Benefits:**
- Decouples services
- Handles spikes
- Automatic retries
- Monitoring

---

### 4.5 WebSocket for Real-Time Updates

```javascript
// Server: Broadcast new notifications
io.to(`student:${studentId}`).emit('notification:new', {
  id: notification.id,
  title: notification.title
});

// Client: Receive in real-time (no polling)
socket.on('notification:new', (notification) => {
  updateUI(notification);
});
```

**vs Polling:**

| Approach | Bandwidth | Latency | Server Load |
|----------|-----------|---------|------------|
| Polling (every 5s) | High | High | High |
| WebSocket | Low | Low (ms) | Low |

---

### 4.6 Complete Scaling Architecture

```
┌─────────────────────────────────────────────────┐
│         Mobile App / Web Frontend                 │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    ┌────────────────────────────┐
    │  API Gateway / Load Balancer  │
    └─────────┬──────────────────┘
              │
    ┌─────────┴──────────┬──────────────┐
    │                    │              │
    ▼                    ▼              ▼
┌─────────┐        ┌─────────┐    ┌──────────┐
│ API 1   │        │ API 2   │    │ API 3    │
└────┬────┘        └────┬────┘    └────┬─────┘
     │                  │              │
     └──────────────────┼──────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
        ┌───▼────┐          ┌──────▼──┐
        │ Redis  │          │ Message │
        │ Cache  │          │ Queue   │
        └────────┘          └──────┬──┘
                                   │
                  ┌────────────────┴────────────┐
                  │                             │
            ┌─────▼──────┐              ┌──────▼─────┐
            │  Primary   │              │  Email/SMS │
            │  Database  │              │  Service   │
            └──┬─────┬──┘               └────────────┘
               │     │
        ┌──────▘     └──────┐
        │                   │
    ┌───▼────┐         ┌────▼───┐
    │Replica1│         │Replica2│
    └────────┘         └────────┘
```

---

## STAGE 5: FAILURE HANDLING & RELIABILITY

### Problem Code

```javascript
function notify_all(student_ids, message):
    for student_id in student_ids:
        send_email(student_id, message)
        save_to_db(student_id, message)
        push_to_app(student_id, message)
```

### Problems Identified

1. **No retry logic**: Single failure stops all
2. **Synchronous execution**: Slow (blocks thread)
3. **All-or-nothing**: Can't handle partial failures
4. **No monitoring**: Can't track failures
5. **No rollback**: Inconsistent state if email succeeds but DB fails

---

### 5.1 Improved Code with Retry Strategy

```javascript
/**
 * Notify all students with retry logic and error handling
 */
async function notifyAll(studentIds, message) {
  const results = {
    success: [],
    failed: [],
    retrying: []
  };

  // Configuration
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Helper: Retry with exponential backoff
  async function retryWithBackoff(
    fn,
    maxRetries = MAX_RETRIES,
    delayMs = RETRY_DELAY
  ) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }
        // Exponential backoff: 1s, 2s, 4s
        await sleep(delayMs * Math.pow(2, attempt));
      }
    }
  }

  // Process each student
  const promises = studentIds.map(async (studentId) => {
    try {
      // Execute operations in parallel with error handling
      const [emailResult, dbResult, pushResult] = await Promise.allSettled([
        retryWithBackoff(() => sendEmail(studentId, message)),
        retryWithBackoff(() => saveToDatabase(studentId, message)),
        retryWithBackoff(() => pushToApp(studentId, message))
      ]);

      // Track results
      const studentResult = {
        studentId,
        email: emailResult.status === 'fulfilled' ? 'success' : 'failed',
        database: dbResult.status === 'fulfilled' ? 'success' : 'failed',
        push: pushResult.status === 'fulfilled' ? 'success' : 'failed'
      };

      // Consider success if at least 2 channels succeed
      if (
        [emailResult, dbResult, pushResult].filter(
          (r) => r.status === 'fulfilled'
        ).length >= 2
      ) {
        results.success.push(studentResult);
      } else {
        results.failed.push(studentResult);
      }

      // Log individual failures
      if (emailResult.status === 'rejected') {
        await logError(`Email failed for ${studentId}:`, emailResult.reason);
      }
      if (dbResult.status === 'rejected') {
        await logError(`DB save failed for ${studentId}:`, dbResult.reason);
      }
      if (pushResult.status === 'rejected') {
        await logError(`Push failed for ${studentId}:`, pushResult.reason);
      }

    } catch (error) {
      results.failed.push({
        studentId,
        error: error.message
      });
    }
  });

  await Promise.all(promises);

  return results;
}
```

---

### 5.2 Event-Driven Queue Architecture

```javascript
// Event Producer
async function sendNotificationBatch(studentIds, message) {
  const batchId = generateUUID();
  
  // Queue for reliable delivery
  const queue = Bull('notification_queue');

  // Add all students to queue
  for (const studentId of studentIds) {
    await queue.add(
      {
        batchId,
        studentId,
        message,
        channels: ['email', 'database', 'push']
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true
      }
    );
  }

  return { success: true, batchId };
}

// Event Consumer / Worker
const queue = Bull('notification_queue');

queue.process(async (job) => {
  const { studentId, message, channels } = job.data;

  const results = {};

  // Execute each channel independently
  for (const channel of channels) {
    try {
      switch (channel) {
        case 'email':
          results.email = await sendEmail(studentId, message);
          break;
        case 'database':
          results.database = await saveToDatabase(studentId, message);
          break;
        case 'push':
          results.push = await pushToApp(studentId, message);
          break;
      }
    } catch (error) {
      results[channel] = { error: error.message };
      
      // If database fails, log to monitoring
      if (channel === 'database') {
        await logCriticalError(`DB failure for student ${studentId}`, error);
      }
    }
  }

  // Job fails if critical operations fail
  if (results.database?.error) {
    throw new Error('Critical: Database operation failed');
  }

  return results;
});

// Queue events
queue.on('completed', async (job, result) => {
  await Log('backend', 'info', 'service', `Notification delivered to ${job.data.studentId}`);
});

queue.on('failed', async (job, error) => {
  await Log('backend', 'error', 'service', `Notification failed for ${job.data.studentId}: ${error.message}`);
  // Send alert to ops
  await notifyOps(`Notification queue failure: ${error.message}`);
});
```

---

### 5.3 Saga Pattern for Distributed Transactions

```javascript
/**
 * Saga: Notify Student
 * Orchestrates multi-step notification delivery with rollback on failure
 */
class NotificationSaga {
  constructor() {
    this.steps = [];
    this.compensations = [];
  }

  // Step 1: Save to database
  async step1_saveToDB(notification) {
    try {
      const saved = await db.notifications.create(notification);
      
      // Compensation: Delete from DB if later steps fail
      this.compensations.push(async () => {
        await db.notifications.delete(saved.id);
      });

      return saved;
    } catch (error) {
      throw new Error(`Step 1 failed: ${error.message}`);
    }
  }

  // Step 2: Send email
  async step2_sendEmail(studentId, message) {
    try {
      await emailService.send(studentId, message);
      
      // Compensation: Log email failure if needed
      this.compensations.push(async () => {
        await Log('backend', 'warn', 'saga', `Email compensation triggered`);
      });

      return true;
    } catch (error) {
      throw new Error(`Step 2 failed: ${error.message}`);
    }
  }

  // Step 3: Push notification
  async step3_pushNotification(studentId, message) {
    try {
      await pushService.send(studentId, message);
      return true;
    } catch (error) {
      throw new Error(`Step 3 failed: ${error.message}`);
    }
  }

  // Execute saga with rollback
  async execute(notification) {
    try {
      await this.step1_saveToDB(notification);
      await this.step2_sendEmail(notification.studentId, notification.message);
      await this.step3_pushNotification(notification.studentId, notification.message);
      
      return { success: true, message: 'All steps completed' };
    } catch (error) {
      // Rollback: Execute compensations in reverse order
      console.error(`Saga failed at: ${error.message}. Rolling back...`);
      
      for (let i = this.compensations.length - 1; i >= 0; i--) {
        try {
          await this.compensations[i]();
        } catch (compensationError) {
          console.error(`Compensation step ${i} failed:`, compensationError);
        }
      }

      throw error;
    }
  }
}

// Usage
const saga = new NotificationSaga();
try {
  await saga.execute({
    studentId: 1042,
    message: 'Placement notification',
    type: 'placement'
  });
} catch (error) {
  console.error('Notification saga failed completely');
}
```

---

## STAGE 6: NOTIFICATION APP BACKEND IMPLEMENTATION

See the separate [notification_app_be](../notification_app_b) directory for complete implementation.

### Key Features Implemented

1. **Priority Inbox Logic**
   - Type-based priority (Placement > Result > Event)
   - Recency-based ranking
   - In-code sorting (no database queries)

2. **API Endpoints**
   - `GET /notifications/top` - Top priority notifications
   - `GET /health` - Health check

3. **Architecture**
   - Layered design (routes → controllers → services)
   - Logging middleware integration
   - Error handling

4. **Reusable Components**
   - Logging from logging_middleware
   - RESTful API design
   - Production-ready code

---

## SUMMARY

| Stage | Focus | Key Takeaway |
|-------|-------|-------------|
| 1 | REST API Design | Well-structured endpoints with proper headers |
| 2 | Database Schema | SQL for transactions, indexes for performance |
| 3 | Query Optimization | Composite indexes, pagination, covering indexes |
| 4 | Scaling | Caching, queue systems, read replicas |
| 5 | Reliability | Retry logic, event-driven, saga pattern |
| 6 | Implementation | Practical backend code with best practices |

This design supports a campus with 10,000+ students, millions of notifications, and real-time delivery at scale.
