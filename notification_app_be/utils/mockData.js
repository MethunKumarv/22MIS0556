/**
 * Fallback mock notifications used when the protected evaluation API is not
 * available to the student environment.
 *
 * The controller still returns a successful JSON response so Postman screenshots
 * can be captured without relying on external authorization.
 */

const MOCK_NOTIFICATIONS = [
  {
    ID: '1',
    Type: 'Placement',
    Message: 'Google hiring drive',
    Timestamp: '2026-04-22 17:51:18'
  },
  {
    ID: '2',
    Type: 'Result',
    Message: 'Semester results published',
    Timestamp: '2026-04-21 10:00:00'
  },
  {
    ID: '3',
    Type: 'Event',
    Message: 'Hackathon this weekend',
    Timestamp: '2026-04-20 09:00:00'
  }
];

module.exports = {
  MOCK_NOTIFICATIONS
};