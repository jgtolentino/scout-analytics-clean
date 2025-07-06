#!/bin/bash

echo "🚀 Starting Gagambi Backend on Render..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
for i in {1..30}; do
    python -c "
import os
import sys
import MySQLdb
try:
    conn = MySQLdb.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        passwd=os.getenv('DB_PASSWORD', ''),
        db=os.getenv('DB_NAME', 'gagambi_db')
    )
    conn.close()
    print('✅ Database connection successful!')
    sys.exit(0)
except Exception as e:
    print(f'Attempt {i}/30: Database not ready... {e}')
    sys.exit(1)
    " && break || sleep 2
done

# Initialize database tables
echo "📊 Initializing database..."
python init_db.py || echo "Database already initialized"

# Start the FastAPI server
echo "🎯 Starting FastAPI server..."
uvicorn app.main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers 1 \
    --log-level info