# Logging Middleware

A reusable, production-grade logging module for backend applications. This package sends structured logs to a centralized evaluation service API.

## Features

- ✅ Input validation for all parameters
- ✅ Support for multiple stack types (backend, frontend)
- ✅ Severity levels (debug, info, warn, error, fatal)
- ✅ Package categorization
- ✅ Error handling
- ✅ Async/await support
- ✅ Returns API responses
- ✅ Reusable across projects

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```javascript
const { Log } = require('./utils/logger');

// Log an info message
await Log('backend', 'info', 'service', 'Operation completed successfully');

// Log an error
await Log('backend', 'error', 'handler', 'Invalid request format');

// Log a warning
await Log('backend', 'warn', 'db', 'Connection pool nearly exhausted');
```

### In Express Middleware

```javascript
const express = require('express');
const { Log } = require('./utils/logger');

const app = express();

app.use(async (req, res, next) => {
  await Log('backend', 'info', 'middleware', `${req.method} ${req.path}`);
  next();
});
```

### Error Handling

```javascript
try {
  const result = await Log('backend', 'info', 'service', 'Fetching data');
  if (!result.success) {
    console.error('Log failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## API Reference

### Log(stack, level, packageName, message)

Main logging function.

#### Parameters

| Parameter | Type | Required | Values |
|-----------|------|----------|---------|
| `stack` | string | Yes | `backend`, `frontend` |
| `level` | string | Yes | `debug`, `info`, `warn`, `error`, `fatal` |
| `packageName` | string | Yes | See allowed packages below |
| `message` | string | Yes | Any non-empty string |

#### Allowed Backend Packages

- `cache`
- `controller`
- `cron_job`
- `db`
- `domain`
- `handler`
- `repository`
- `route`
- `service`

#### Allowed Shared Packages

- `auth`
- `config`
- `middleware`
- `utils`

#### Returns

```javascript
// Success
{
  success: true,
  data: { /* API response */ }
}

// Validation Error
{
  success: false,
  error: "Error message describing the issue"
}

// Network Error
{
  success: false,
  error: "Failed to send log: error details",
  originalError: "error message"
}
```

#### Example Request Body Sent to API

```json
{
  "stack": "backend",
  "level": "error",
  "package": "handler",
  "message": "received string, expected bool"
}
```

## API Endpoint

**URL:** `http://4.224.186.213/evaluation-service/logs`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

## Input Validation

The logger validates all inputs before sending:

- **Stack**: Must be either `backend` or `frontend`
- **Level**: Must be one of `debug`, `info`, `warn`, `error`, or `fatal`
- **Package**: Must be valid for the specified stack
- **Message**: Must be a non-empty string

Invalid parameters return validation errors without making API calls.

## Error Handling

The logger includes comprehensive error handling:

- Parameter validation
- Network error handling
- HTTP status code checking
- Response parsing errors
- Graceful fallback to error object returns

## Performance Considerations

- Non-blocking async operations
- Single HTTP request per log call
- No queuing or batching (sent immediately)
- Suitable for development and production

## Environment

Requires Node.js 14.0.0 or higher.

No dependencies beyond Node.js built-in modules.

## Testing

```bash
npm test
```

## License

ISC

## Support

For issues or questions, contact the development team.
