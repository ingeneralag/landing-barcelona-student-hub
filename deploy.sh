#!/bin/bash

# Script للرفع التلقائي على السيرفر عبر GitHub
# Usage: ./deploy.sh [commit message]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMMIT_MSG="${1:-Update: $(date +'%Y-%m-%d %H:%M:%S')}"

echo -e "${GREEN}🚀 Starting deployment...${NC}\n"

# Check if .env.deploy exists
if [ ! -f ".env.deploy" ]; then
    echo -e "${YELLOW}⚠️  .env.deploy not found. Creating template...${NC}"
    cat > .env.deploy << EOF
# Server SSH Configuration
SSH_HOST=your-server.com
SSH_USER=your-username
SSH_PORT=22
SSH_KEY_PATH=~/.ssh/id_rsa

# Server Paths
SERVER_PROJECT_PATH=/var/www/alojamiento-barcelona
SERVER_BACKEND_PATH=/var/www/alojamiento-barcelona
SERVER_FRONTEND_PATH=/var/www/alojamiento-barcelona

# Build Commands
BUILD_COMMAND="npm run build"
RESTART_BACKEND="pm2 restart server || systemctl restart alojamiento-barcelona || node server.js"
EOF
    echo -e "${GREEN}✅ Created .env.deploy template. Please fill it with your server details.${NC}"
    exit 1
fi

# Load deployment configuration
source .env.deploy

# Validate configuration
if [ -z "$SSH_HOST" ] || [ -z "$SSH_USER" ]; then
    echo -e "${RED}❌ Error: SSH_HOST and SSH_USER must be set in .env.deploy${NC}"
    exit 1
fi

# Step 1: Check Git status
echo -e "${BLUE}📋 Checking Git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected. Committing...${NC}"
    git add .
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# Step 2: Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Try to push (credentials should be in remote URL or git config)
if git push origin "$CURRENT_BRANCH" 2>&1; then
    echo -e "${GREEN}✅ Pushed to GitHub successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Push failed, trying with force-with-lease...${NC}"
    if git push --force-with-lease origin "$CURRENT_BRANCH" 2>&1; then
        echo -e "${GREEN}✅ Pushed to GitHub successfully (force)${NC}"
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        echo -e "${YELLOW}Do you want to continue with deployment anyway? (y/n)${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Step 3: Connect to server and pull from GitHub
echo -e "${BLUE}🔌 Connecting to server...${NC}"
SSH_CMD="ssh -p ${SSH_PORT:-22} -i ${SSH_KEY_PATH:-~/.ssh/id_rsa} ${SSH_USER}@${SSH_HOST}"

# Check if git is initialized on server
echo -e "${BLUE}📥 Pulling latest changes from GitHub on server...${NC}"
$SSH_CMD "cd ${SERVER_PROJECT_PATH} && git pull origin $CURRENT_BRANCH || (echo 'Git pull failed, trying to fetch and reset...' && git fetch origin && git reset --hard origin/$CURRENT_BRANCH)"

# Step 4: Install dependencies
echo -e "${GREEN}📦 Installing dependencies on server...${NC}"
$SSH_CMD "cd ${SERVER_PROJECT_PATH} && npm install"

# Step 5: Build project
echo -e "${GREEN}🔨 Building project on server...${NC}"
$SSH_CMD "cd ${SERVER_PROJECT_PATH} && ${BUILD_COMMAND}"

# Step 6: Restart server
echo -e "${GREEN}🔄 Restarting server...${NC}"
$SSH_CMD "cd ${SERVER_BACKEND_PATH} && ${RESTART_BACKEND}"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Your changes are now live on the server${NC}"

