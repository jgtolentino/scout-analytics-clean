#!/bin/bash

# Scout Dashboard Deployment Script
# This script helps deploy the Scout Dashboard to various platforms

echo "🚀 Scout Dashboard Deployment Script"
echo "===================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local from .env.example and fill in your values."
    exit 1
fi

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "Choose deployment platform:"
echo "1) Vercel"
echo "2) Netlify"
echo "3) Docker"
echo "4) Preview locally"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command_exists vercel; then
            echo "Installing Vercel CLI..."
            npm i -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command_exists netlify; then
            echo "Installing Netlify CLI..."
            npm i -g netlify-cli
        fi
        netlify deploy --prod
        ;;
    3)
        echo "🐳 Building Docker image..."
        docker build -t scout-dashboard .
        echo "✅ Docker image built!"
        echo "Run with: docker run -p 3000:3000 scout-dashboard"
        ;;
    4)
        echo "👀 Starting preview server..."
        npm run start
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac