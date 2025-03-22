#!/bin/bash

# Simple health check script for GameHub deployment

# Default to localhost:5001 if no host provided
HOST=${1:-"http://localhost:5001"}

echo "Checking GameHub deployment at $HOST..."

# Check main page
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HOST)
if [ $STATUS -eq 200 ]; then
  echo "✅ Main page: OK (HTTP $STATUS)"
else
  echo "❌ Main page: FAILED (HTTP $STATUS)"
fi

# Check API endpoints
API_ENDPOINTS=("/api/games" "/api/games/featured" "/api/leaderboard")

for endpoint in "${API_ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HOST$endpoint)
  if [ $STATUS -eq 200 ]; then
    echo "✅ $endpoint: OK (HTTP $STATUS)"
  else
    echo "❌ $endpoint: FAILED (HTTP $STATUS)"
  fi
done

echo "Health check complete!"