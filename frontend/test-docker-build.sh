#!/bin/bash

# Test Docker build for frontend
# This script helps test the Docker build locally before deploying

set -e

echo "🧪 Testing Frontend Docker Build..."
echo ""

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t contextfirstai-frontend:test -f Dockerfile .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker build successful!"
    echo ""
    echo "🚀 To run the container locally:"
    echo "   docker run -p 3001:3001 contextfirstai-frontend:test"
    echo ""
    echo "🌐 Then visit: http://localhost:3001"
else
    echo ""
    echo "❌ Docker build failed!"
    exit 1
fi

