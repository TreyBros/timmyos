#!/bin/bash

echo "🧠 Starting TimmyOS..."

# Check if node_modules exists in server
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm install && cd ..
fi

# Check if node_modules exists in client
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Start server in background
echo "🚀 Starting server..."
cd server && npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Start client
echo "🎨 Starting client..."
cd client && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ TimmyOS is running!"
echo "   Dashboard: http://localhost:3000"
echo "   API: http://localhost:3333"
echo ""
echo "Press Ctrl+C to stop"

# Wait for interrupt
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
