#!/bin/bash

echo "🚀 Starting HR Ease Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start PostgreSQL container
echo "🐘 Starting PostgreSQL database..."
docker compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=30
counter=0

while ! docker exec hr_ease_postgres pg_isready -U postgres -d hr_ease > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database failed to start within $timeout seconds"
        exit 1
    fi
    echo "   ... waiting for database (${counter}s)"
    sleep 1
    counter=$((counter + 1))
done

echo "✅ Database is ready!"

# Check if port 3000 is occupied and clear it
echo "🔍 Checking if port 3000 is available..."

# Function to check if port is in use
check_port() {
    lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to clear port 3000
clear_port() {
    echo "⚠️  Port 3000 is occupied. Clearing it..."
    
    # Try graceful shutdown first
    if pids=$(lsof -ti:3000 2>/dev/null); then
        echo "   🔄 Attempting graceful shutdown..."
        echo "$pids" | xargs kill -TERM 2>/dev/null || true
        sleep 3
        
        # Force kill if still running
        if check_port; then
            echo "   💀 Force killing processes on port 3000..."
            echo "$pids" | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    fi
    
    # Also kill any existing NestJS processes
    echo "   🧹 Cleaning up any existing NestJS processes..."
    pkill -f "nest start" 2>/dev/null || true
    pkill -f "node.*dist/main" 2>/dev/null || true
    sleep 1
    
    # Final check
    if check_port; then
        echo "   ❌ Failed to clear port 3000. Please manually stop the process."
        exit 1
    else
        echo "   ✅ Port 3000 cleared successfully!"
    fi
}

# Check and clear port if needed
if check_port; then
    clear_port
else
    echo "✅ Port 3000 is available!"
fi

# Run migrations
echo "🔄 Running database migrations..."
npm run migration:run

# Start the application
echo "🎯 Starting NestJS application..."
echo "📚 Swagger documentation will be available at: http://localhost:3000/docs"
echo "🔗 API base URL: http://localhost:3000/api/v1"
npm run start:dev
