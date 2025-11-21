#!/bin/bash

# Script لإصلاح إعدادات Nginx لرفع الملفات الكبيرة
# Usage: ./nginx-config-fix.sh

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

echo -e "${BLUE}🔍 Checking Nginx configuration...${NC}"

# Find Nginx config file
NGINX_CONFIG=$($SSH_CMD "ls /etc/nginx/sites-available/* 2>/dev/null | head -1 || echo '/etc/nginx/nginx.conf'")

echo -e "${BLUE}📝 Found config: $NGINX_CONFIG${NC}"

# Check if client_max_body_size exists
if $SSH_CMD "grep -q 'client_max_body_size' $NGINX_CONFIG 2>/dev/null"; then
    echo -e "${YELLOW}⚠️  client_max_body_size already exists, updating...${NC}"
    $SSH_CMD "sed -i 's/client_max_body_size.*/client_max_body_size 50M;/' $NGINX_CONFIG"
else
    echo -e "${BLUE}➕ Adding client_max_body_size to http block...${NC}"
    $SSH_CMD "sed -i '/^http {/a\    client_max_body_size 50M;' $NGINX_CONFIG"
fi

# Also add to server block if it exists
if $SSH_CMD "grep -q 'server {' $NGINX_CONFIG 2>/dev/null"; then
    echo -e "${BLUE}➕ Adding client_max_body_size to server block...${NC}"
    $SSH_CMD "sed -i '/server {/a\        client_max_body_size 50M;' $NGINX_CONFIG || true"
fi

# Test Nginx configuration
echo -e "${BLUE}🧪 Testing Nginx configuration...${NC}"
if $SSH_CMD "nginx -t 2>&1"; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    echo -e "${BLUE}🔄 Reloading Nginx...${NC}"
    $SSH_CMD "systemctl reload nginx || service nginx reload || nginx -s reload"
    echo -e "${GREEN}✅ Nginx reloaded successfully!${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nginx configuration updated!${NC}"
echo -e "${BLUE}📋 Updated config:${NC}"
$SSH_CMD "grep 'client_max_body_size' $NGINX_CONFIG || echo 'Not found'"

