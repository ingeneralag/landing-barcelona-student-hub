#!/bin/bash

# Script لإعادة تشغيل الـ server على السيرفر
# Usage: ./restart-server.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.deploy exists
if [ ! -f ".env.deploy" ]; then
    echo -e "${RED}❌ Error: .env.deploy not found${NC}"
    exit 1
fi

# Load deployment configuration
source .env.deploy

# Validate configuration
if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ]; then
    echo -e "${RED}❌ Error: SSH_HOST and SSH_USER must be set in .env.deploy${NC}"
    exit 1
fi

SSH_CMD="ssh -p ${SSH_PORT:-22} -i ${SSH_KEY_PATH:-~/.ssh/id_rsa} ${SSH_USER}@${SSH_HOST}"

echo -e "${BLUE}🔍 Checking server status...${NC}"

# Check if pm2 is running
if $SSH_CMD "pm2 list" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2 is running${NC}"
    echo -e "${BLUE}🔄 Restarting server with PM2...${NC}"
    $SSH_CMD "cd ${SERVER_BACKEND_PATH} && pm2 restart server || pm2 start server.js --name server"
else
    echo -e "${YELLOW}⚠️  PM2 not found, checking if Node.js server is running...${NC}"
    
    # Check if server is running on port 5515 (or PORT from env)
    if $SSH_CMD "lsof -i :5515 || lsof -i :4242" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Server is running but not with PM2. Killing and restarting...${NC}"
        $SSH_CMD "pkill -f 'node server.js' || true"
    fi
    
    echo -e "${BLUE}🚀 Starting server...${NC}"
    $SSH_CMD "cd ${SERVER_BACKEND_PATH} && nohup node server.js > server.log 2>&1 &"
    sleep 2
fi

# Verify server is running
echo -e "${BLUE}✅ Verifying server is running...${NC}"
if $SSH_CMD "lsof -i :5515 || lsof -i :4242" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running successfully!${NC}"
else
    echo -e "${RED}❌ Server failed to start. Check server.log for errors${NC}"
    echo -e "${YELLOW}Last 20 lines of server.log:${NC}"
    $SSH_CMD "cd ${SERVER_BACKEND_PATH} && tail -20 server.log || echo 'No log file found'"
    exit 1
fi

echo -e "${GREEN}✅ Server restart completed!${NC}"

