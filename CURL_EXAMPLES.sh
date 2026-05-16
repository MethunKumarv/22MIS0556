#!/bin/bash

# ============================================================
# CURL Commands Collection
# Vehicle Maintenance Scheduler & Notification App Backend
# ============================================================

echo "=== Vehicle Maintenance Scheduler Endpoints ==="

# Health Check
echo -e "\n1. Health Check - Vehicle Scheduler:"
curl -s -X GET http://localhost:3001/health | jq '.'

# Generate Schedule for Depot 1
echo -e "\n2. Generate Schedule - Depot 1:"
curl -s -X GET http://localhost:3001/schedule/1 | jq '.'

# Generate Schedule for Depot 2
echo -e "\n3. Generate Schedule - Depot 2:"
curl -s -X GET http://localhost:3001/schedule/2 | jq '.'

# Invalid Depot ID
echo -e "\n4. Invalid Depot ID (should get error):"
curl -s -X GET http://localhost:3001/schedule/invalid | jq '.'

# Depot Not Found
echo -e "\n5. Depot Not Found (404):"
curl -s -X GET http://localhost:3001/schedule/999 | jq '.'

echo -e "\n\n=== Notification App Backend Endpoints ==="

# Health Check
echo -e "\n6. Health Check - Notification App:"
curl -s -X GET http://localhost:3002/health | jq '.'

# Top 10 Notifications
echo -e "\n7. Top 10 Notifications:"
curl -s -X GET "http://localhost:3002/notifications/top?limit=10" | jq '.'

# Top 5 Notifications
echo -e "\n8. Top 5 Notifications:"
curl -s -X GET "http://localhost:3002/notifications/top?limit=5" | jq '.'

# Invalid Limit
echo -e "\n9. Invalid Limit (should get error):"
curl -s -X GET "http://localhost:3002/notifications/top?limit=-5" | jq '.'

# Limit Over Max (should cap to 100)
echo -e "\n10. Limit Over Max (auto-capped to 100):"
curl -s -X GET "http://localhost:3002/notifications/top?limit=200" | jq '.limit'

echo -e "\n\n=== Additional Test Commands ==="

# Test both servers are running
echo -e "\n11. Check both servers running:"
echo "Vehicle Scheduler:"
curl -s -I http://localhost:3001/health | head -1
echo "Notification App:"
curl -s -I http://localhost:3002/health | head -1

echo -e "\n✅ Test commands completed"
