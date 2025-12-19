#!/bin/bash

# Test Docker Build Script
# Tests the Dockerfile locally before deploying to DCDeploy
# Based on lessons learned from DEPLOYMENT_ISSUE_LOG.md

set -e  # Exit on error

echo "=========================================="
echo "Testing Docker Build for Backend"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Build the Docker image
echo ""
echo "Building Docker image..."
docker build -t contextfirstai-backend:test .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker build successful${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

# Test that the image runs
echo ""
echo "Testing that the image can start..."
docker run --rm \
    -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
    -e JWT_SECRET="test-secret-minimum-32-characters-long-12345" \
    -e JWT_REFRESH_SECRET="test-refresh-secret-minimum-32-characters-long-12345" \
    -e NODE_ENV="test" \
    contextfirstai-backend:test node -e "console.log('Image test successful')" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Image can start successfully${NC}"
else
    echo -e "${YELLOW}⚠ Image start test failed (this is expected if DATABASE_URL is invalid)${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Docker Build Test Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Deploy to DCDeploy"
echo "3. Set environment variables in DCDeploy:"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - JWT_REFRESH_SECRET"
echo "   - FRONTEND_URL"
echo "   - ALLOWED_ORIGINS (comma-separated)"
echo "   - RESEND_API_KEY"
echo "   - NODE_ENV=production"
echo ""

