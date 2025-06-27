#!/bin/bash

echo "🚀 Starting Gagambi Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
python init_db.py

# Start the application
echo "🎯 Starting FastAPI server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000