#!/bin/bash

# GameHub deployment script

echo "Starting GameHub deployment process..."

# Install production dependencies
echo "Installing production dependencies..."
npm install --production

# Set production environment
export NODE_ENV=production

# Start the server
echo "Starting the server..."
if [ -z "$PORT" ]; then
  echo "Using default port 5001"
  PORT=5001 npm start
else
  echo "Using port $PORT"
  npm start
fi