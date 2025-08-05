#!/bin/bash

echo "🧪 Testing Scout Dashboard + Tableau Extensions Setup"
echo "===================================================="

cd "$(dirname "$0")"

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Scout Dashboard dependencies..."
    npm install
fi

# Check Tableau Extensions API
if [ ! -d "tableau-extensions-api/node_modules" ]; then
    echo "📦 Installing Tableau Extensions dependencies..."
    cd tableau-extensions-api
    npm install
    cd ..
fi

echo ""
echo "🚀 Starting development servers..."
echo ""

# Start Scout Dashboard (port 3000)
echo "Starting Scout Dashboard on http://localhost:3000"
npm run dev &
SCOUT_PID=$!

# Wait a moment for first server to start
sleep 3

# Start Tableau Extensions (port 8765)
echo "Starting Tableau Extensions on http://localhost:8765"
cd tableau-extensions-api
npm start &
TABLEAU_PID=$!
cd ..

# Wait for servers to start
echo "⏳ Waiting for servers to start..."
sleep 5

echo ""
echo "🌐 Testing server connections..."

# Test Scout Dashboard
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Scout Dashboard: http://localhost:3000 - RUNNING"
else
    echo "❌ Scout Dashboard: http://localhost:3000 - NOT RESPONDING"
fi

# Test Tableau Extensions  
if curl -f -s http://localhost:8765 > /dev/null 2>&1; then
    echo "✅ Tableau Extensions: http://localhost:8765 - RUNNING"
else
    echo "❌ Tableau Extensions: http://localhost:8765 - NOT RESPONDING"
fi

echo ""
echo "📋 Quick Setup Summary:"
echo "======================"
echo "1. Scout Dashboard: http://localhost:3000"
echo "   • Story Mode Toggle ✅"
echo "   • AI Explain Buttons ✅" 
echo "   • Tableau Extension Page: http://localhost:3000/tableau-extension"
echo ""
echo "2. Tableau Extensions: http://localhost:8765"
echo "   • Sample Extensions ✅"
echo "   • Development Tools ✅"
echo ""
echo "3. Extension Manifest: http://localhost:3000/scout-dashboard-extension.trex"
echo ""
echo "🎯 Next Steps:"
echo "1. Open Tableau Desktop 2018.2+"
echo "2. Create a new dashboard"  
echo "3. Add Extension object"
echo "4. Browse to the .trex file above"
echo "5. Test Scout Dashboard in Tableau!"
echo ""
echo "Press Ctrl+C to stop both servers"

# Keep script running
wait