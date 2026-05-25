#!/bin/bash

# zkSync Era Test Runner
# Starts a local era-test-node, runs Hardhat tests, then stops the node.

set -e

NODE_PORT="${ZKSYNC_NODE_PORT:-8011}"
NODE_PID=""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if [ -n "$NODE_PID" ] && kill -0 "$NODE_PID" 2>/dev/null; then
        echo -e "${YELLOW}⏹  Stopping era-test-node (PID: $NODE_PID)...${NC}"
        kill "$NODE_PID" 2>/dev/null || true
        wait "$NODE_PID" 2>/dev/null || true
        echo -e "${GREEN}✅ Node stopped${NC}"
    fi
    # Also try to find and kill any remaining era-test-node processes
    REMAINING=$(pgrep -f "era-test-node" 2>/dev/null || true)
    if [ -n "$REMAINING" ]; then
        kill $REMAINING 2>/dev/null || true
    fi
}

trap cleanup EXIT INT TERM

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}   🚀 zkSync Era Test Runner${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# Step 1: Check if port is available
if curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:"$NODE_PORT" 2>/dev/null | grep -q '200\|403\|404\|500'; then
    echo -e "${YELLOW}⚠️  Port $NODE_PORT is already in use.${NC}"
    echo -e "${YELLOW}   Make sure no other era-test-node is running.${NC}"
    exit 1
fi

# Step 2: Start era-test-node in background
echo -e "${BLUE}📡 Starting era-test-node on port $NODE_PORT...${NC}"
npx hardhat node-zksync --port "$NODE_PORT" --log error &
NODE_PID=$!
echo -e "${GREEN}   ✅ Node started (PID: $NODE_PID)${NC}"

# Step 3: Wait for node to be ready
echo -e "${BLUE}⏳ Waiting for node to be ready...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        http://127.0.0.1:"$NODE_PORT" 2>/dev/null | grep -q "result"; then
        echo -e "${GREEN}   ✅ Node is ready!${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $((RETRY_COUNT % 5)) -eq 0 ]; then
        echo -e "${YELLOW}   Still waiting... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    fi
    sleep 2
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}❌ Timed out waiting for node to start${NC}"
    exit 1
fi

echo ""

# Step 4: Run Hardhat tests
echo -e "${BLUE}🧪 Running tests...${NC}"
echo -e "${BLUE}   Command: npx hardhat test --network localNode${NC}"
echo ""

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
