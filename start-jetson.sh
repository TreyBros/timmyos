#!/bin/bash

# TimmyOS Start Script
# Self-hosted on Jetson - serves both frontend and backend

cd "$(dirname "$0")"

# Set API key (change this for production)
export TIMMYOS_API_KEY="${TIMMYOS_API_KEY:-timmy-secure-2024}"

# Build frontend if needed
if [ ! -d "client/dist" ]; then
  echo "🔨 Building frontend..."
  cd client && npm run build && cd ..
fi

# Kill any existing server
pkill -f "node server.js" 2>/dev/null

echo "🧠 Starting TimmyOS..."
echo ""
echo "📱 Access at:"
echo "   Local:   http://localhost:3333"
echo "   Network: http://10.0.0.204:3333"
echo ""
echo "🔑 API Key: $TIMMYOS_API_KEY"
echo ""

# Start server
cd server && node server.js
