#!/bin/bash

# zkSync Era Test Runner (Docker)
# Runs era-test-node in a Docker container and executes Hardhat tests.
# Requires Docker to be installed and running.

set -e

CONTAINER_NAME="zksync-era-test-node"
NODE_PORT="${ZKSYNC_NODE_PORT:-8011}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if docker ps -q -f name="$CONTAINER_NAME" 2>/dev/null | grep -q .; then
        echo -e "${YELLOW}⏹  Stopping Docker container...${NC}"
        docker stop "$CONTAINER_NAME" > /dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" > /dev/null 2>&1 || true
        echo -e "${GREEN}✅ Container stopped${NC}"
    fi
}

trap cleanup EXIT INT TERM

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}   🚀 zkSync Era Test Runner (Docker)${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# Step 1: Check Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Step 2: Start era-test-node container
echo -e "${BLUE}📡 Starting era-test-node container...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$NODE_PORT:8011" \
    matterlabs/era-test-node:latest \
    --port 8011 --log error 2>&1

echo -e "${GREEN}   ✅ Container started${NC}"

# Step 3: Wait for node to be ready
echo -e "${BLUE}⏳ Waiting for node to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec "$CONTAINER_NAME" curl -s -X POST \
        -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        http://127.0.0.1:"$NODE_PORT" 2>/dev/null | grep -q "result"; then
        echo -e "${GREEN}   ✅ Node is ready!${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 2
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}❌ Timed out waiting for node to start${NC}"
    docker logs "$CONTAINER_NAME" 2>&1 | tail -20
    exit 1
fi

echo ""

# Step 4: Run Hardhat tests
echo -e "${BLUE}🧪 Running tests...${NC}"
if npx hardhat test --network localNode 2>&1; then
    echo ""
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${GREEN}   ✅ All tests passed!${NC}"
    echo -e "${GREEN}================================================================${NC}"
else
    TEST_EXIT_CODE=$?
    echo ""
    echo -e "${RED}================================================================${NC}"
    echo -e "${RED}   ❌ Tests failed with exit code: $TEST_EXIT_CODE${NC}"
    echo -e "${RED}================================================================${NC}"
    exit $TEST_EXIT_CODE
fi
