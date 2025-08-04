#!/bin/bash

# Borderless Techno Company - Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="borderless-saas"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backups"
LOG_FILE="deploy-${ENVIRONMENT}-${TIMESTAMP}.log"

# Environment-specific configurations
if [ "$ENVIRONMENT" = "production" ]; then
    SERVER_HOST=${PRODUCTION_SERVER}
    SERVER_USER=${PRODUCTION_USER}
    SSH_KEY=${PRODUCTION_SSH_KEY}
    APP_DIR="/var/www/borderless-production"
    PM2_APP_NAME="borderless-prod"
    DOMAIN="borderlesstechno.com"
elif [ "$ENVIRONMENT" = "staging" ]; then
    SERVER_HOST=${STAGING_SERVER}
    SERVER_USER=${STAGING_USER}
    SSH_KEY=${STAGING_SSH_KEY}
    APP_DIR="/var/www/borderless-staging"
    PM2_APP_NAME="borderless-staging"
    DOMAIN="staging.borderlesstechno.com"
else
    echo -e "${RED}❌ Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log "${RED}❌ Deployment failed at step: $1${NC}"
    log "${YELLOW}📋 Check the log file: $LOG_FILE${NC}"
    exit 1
}

# Pre-deployment checks
pre_deployment_checks() {
    log "${BLUE}🔍 Running pre-deployment checks...${NC}"
    
    # Check if required environment variables are set
    if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ]; then
        handle_error "Missing server configuration"
    fi
    
    # Check if we're on the correct branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        log "${RED}❌ Production deployments must be from 'main' branch (currently on '$CURRENT_BRANCH')${NC}"
        exit 1
    fi
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log "${RED}❌ You have uncommitted changes. Please commit or stash them first.${NC}"
        exit 1
    fi
    
    # Run tests
    log "${YELLOW}🧪 Running tests...${NC}"
    cd client && npm run lint || handle_error "Frontend linting failed"
    cd ../server
    # Add backend tests here when available
    # npm test || handle_error "Backend tests failed"
    cd ..
    
    log "${GREEN}✅ Pre-deployment checks passed${NC}"
}

# Build application
build_application() {
    log "${BLUE}🏗️  Building application...${NC}"
    
    # Build frontend
    log "${YELLOW}📦 Building frontend...${NC}"
    cd client
    npm ci --production=false || handle_error "Frontend dependency installation failed"
    npm run build:production || handle_error "Frontend build failed"
    cd ..
    
    # Prepare backend
    log "${YELLOW}📦 Preparing backend...${NC}"
    cd server
    npm ci --production || handle_error "Backend dependency installation failed"
    cd ..
    
    log "${GREEN}✅ Application built successfully${NC}"
}

# Create deployment package
create_deployment_package() {
    log "${BLUE}📦 Creating deployment package...${NC}"
    
    PACKAGE_NAME="${PROJECT_NAME}-${ENVIRONMENT}-${TIMESTAMP}.tar.gz"
    
    # Create temporary directory for packaging
    mkdir -p temp_deploy
    
    # Copy necessary files
    cp -r server temp_deploy/
    cp -r client/dist temp_deploy/client
    cp package.json temp_deploy/ 2>/dev/null || true
    cp ecosystem.config.js temp_deploy/ 2>/dev/null || true
    
    # Create package
    tar -czf "$PACKAGE_NAME" -C temp_deploy .
    
    # Cleanup
    rm -rf temp_deploy
    
    log "${GREEN}✅ Deployment package created: $PACKAGE_NAME${NC}"
    echo "$PACKAGE_NAME"
}

# Deploy to server
deploy_to_server() {
    local PACKAGE_NAME=$1
    
    log "${BLUE}🚀 Deploying to $ENVIRONMENT server...${NC}"
    
    # Create SSH command
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
    if [ -n "$SSH_KEY" ]; then
        SSH_CMD="$SSH_CMD -i $SSH_KEY"
    fi
    SSH_CMD="$SSH_CMD $SERVER_USER@$SERVER_HOST"
    
    # Create SCP command
    SCP_CMD="scp -o StrictHostKeyChecking=no"
    if [ -n "$SSH_KEY" ]; then
        SCP_CMD="$SCP_CMD -i $SSH_KEY"
    fi
    
    # Upload package
    log "${YELLOW}📤 Uploading deployment package...${NC}"
    $SCP_CMD "$PACKAGE_NAME" "$SERVER_USER@$SERVER_HOST:/tmp/" || handle_error "Package upload failed"
    
    # Execute deployment on server
    log "${YELLOW}🔧 Executing deployment on server...${NC}"
    $SSH_CMD << EOF
        set -e
        
        # Create backup of current deployment
        if [ -d "$APP_DIR" ]; then
            echo "📋 Creating backup of current deployment..."
            sudo mv "$APP_DIR" "${APP_DIR}-backup-${TIMESTAMP}" || true
        fi
        
        # Create application directory
        sudo mkdir -p "$APP_DIR"
        sudo chown $SERVER_USER:$SERVER_USER "$APP_DIR"
        
        # Extract new deployment
        echo "📦 Extracting deployment package..."
        cd "$APP_DIR"
        tar -xzf "/tmp/$PACKAGE_NAME"
        
        # Set permissions
        sudo chown -R $SERVER_USER:$SERVER_USER "$APP_DIR"
        chmod +x "$APP_DIR/server/scripts/"*.js 2>/dev/null || true
        
        # Install production dependencies (if not already installed)
        cd "$APP_DIR/server"
        npm ci --production --silent
        
        # Restart application with PM2
        echo "🔄 Restarting application..."
        pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
        pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
        
        # Start application
        cd "$APP_DIR"
        pm2 start ecosystem.config.js --env $ENVIRONMENT --name "$PM2_APP_NAME" 2>/dev/null || \
        pm2 start server/src/index.js --name "$PM2_APP_NAME" --env $ENVIRONMENT
        
        pm2 save
        
        # Cleanup
        rm "/tmp/$PACKAGE_NAME"
        
        echo "✅ Deployment completed on server"
EOF
    
    log "${GREEN}✅ Server deployment completed${NC}"
}

# Run health checks
run_health_checks() {
    log "${BLUE}🏥 Running health checks...${NC}"
    
    local MAX_ATTEMPTS=30
    local ATTEMPT=1
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
        log "${YELLOW}🔍 Health check attempt $ATTEMPT/$MAX_ATTEMPTS...${NC}"
        
        if curl -f -s "https://$DOMAIN/api/health" > /dev/null; then
            log "${GREEN}✅ Health check passed${NC}"
            return 0
        fi
        
        sleep 10
        ATTEMPT=$((ATTEMPT + 1))
    done
    
    handle_error "Health checks failed after $MAX_ATTEMPTS attempts"
}

# Rollback function
rollback() {
    log "${YELLOW}🔄 Rolling back deployment...${NC}"
    
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
    if [ -n "$SSH_KEY" ]; then
        SSH_CMD="$SSH_CMD -i $SSH_KEY"
    fi
    SSH_CMD="$SSH_CMD $SERVER_USER@$SERVER_HOST"
    
    $SSH_CMD << EOF
        set -e
        
        # Stop current application
        pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
        pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
        
        # Restore backup
        if [ -d "${APP_DIR}-backup-${TIMESTAMP}" ]; then
            sudo rm -rf "$APP_DIR"
            sudo mv "${APP_DIR}-backup-${TIMESTAMP}" "$APP_DIR"
            
            # Restart from backup
            cd "$APP_DIR"
            pm2 start ecosystem.config.js --env $ENVIRONMENT --name "$PM2_APP_NAME" 2>/dev/null || \
            pm2 start server/src/index.js --name "$PM2_APP_NAME"
            pm2 save
            
            echo "✅ Rollback completed"
        else
            echo "❌ No backup found for rollback"
            exit 1
        fi
EOF
    
    log "${GREEN}✅ Rollback completed${NC}"
}

# Main deployment flow
main() {
    log "${GREEN}🚀 Starting deployment to $ENVIRONMENT at $(date)${NC}"
    
    # Create logs directory
    mkdir -p logs
    
    # Trap errors for potential rollback
    trap 'log "${RED}❌ Deployment failed. Run ./scripts/deploy.sh rollback to restore previous version${NC}"' ERR
    
    # Check if this is a rollback command
    if [ "$1" = "rollback" ]; then
        rollback
        exit 0
    fi
    
    pre_deployment_checks
    build_application
    PACKAGE_NAME=$(create_deployment_package)
    deploy_to_server "$PACKAGE_NAME"
    run_health_checks
    
    # Cleanup local package
    rm -f "$PACKAGE_NAME"
    
    log "${GREEN}🎉 Deployment to $ENVIRONMENT completed successfully!${NC}"
    log "${BLUE}🌐 Application is available at: https://$DOMAIN${NC}"
    log "${YELLOW}📋 Deployment log: $LOG_FILE${NC}"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [staging|production|rollback]"
    echo "Examples:"
    echo "  $0 staging    # Deploy to staging"
    echo "  $0 production # Deploy to production"
    echo "  $0 rollback   # Rollback last deployment"
    exit 1
fi

# Run main function
main "$@"