#!/bin/bash

# Script للرفع التلقائي على السيرفر
# Usage: ./deploy.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

echo -e "${GREEN}📦 Building project...${NC}"
npm run build

echo -e "${GREEN}📤 Uploading files to server...${NC}"

# Create SSH command
SSH_CMD="ssh -p ${SSH_PORT:-22} -i ${SSH_KEY_PATH:-~/.ssh/id_rsa} ${SSH_USER}@${SSH_HOST}"

# Upload files using rsync
rsync -avz --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude 'dist' \
    --exclude '.DS_Store' \
    -e "ssh -p ${SSH_PORT:-22} -i ${SSH_KEY_PATH:-~/.ssh/id_rsa}" \
    ./ ${SSH_USER}@${SSH_HOST}:${SERVER_PROJECT_PATH}/

echo -e "${GREEN}📥 Installing dependencies on server...${NC}"
$SSH_CMD "cd ${SERVER_PROJECT_PATH} && npm install --production"

echo -e "${GREEN}🔨 Building on server...${NC}"
$SSH_CMD "cd ${SERVER_PROJECT_PATH} && ${BUILD_COMMAND}"

echo -e "${GREEN}🔄 Restarting server...${NC}"
$SSH_CMD "cd ${SERVER_BACKEND_PATH} && ${RESTART_BACKEND}"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

