#!/bin/bash

# Production Deployment Script for BORDERLESS TECHNO COMPANY
# Deploy to BanaHosting - borderlesstechno.com

echo "🚀 Starting production deployment for borderlesstechno.com..."

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Install dependencies
print_status "Installing client dependencies..."
cd client
npm install

print_status "Installing server dependencies..."
cd ../server
npm install

# Step 2: Build client for production
print_status "Building client for production..."
cd ../client
npm run build

print_status "Client build completed. Files are in client/dist/"

# Step 3: Prepare deployment package
print_status "Creating deployment package..."
cd ..

# Create deployment directory
mkdir -p deployment

# Copy server files
cp -r server/* deployment/
rm -rf deployment/node_modules

# Copy built client files to server's public directory
mkdir -p deployment/public
cp -r client/dist/* deployment/public/

# Copy production environment files
cp server/.env.production deployment/.env

print_status "Deployment package created in ./deployment/"

# Step 4: Create archive for upload
print_status "Creating deployment archive..."
tar -czf borderless-production.tar.gz -C deployment .

print_status "Deployment archive created: borderless-production.tar.gz"

echo ""
echo "📦 Deployment package ready!"
echo ""
echo "Next steps for BanaHosting deployment:"
echo "1. Upload borderless-production.tar.gz to your hosting server"
echo "2. Extract the archive in your domain's root directory"
echo "3. Configure your .env file with actual production values"
echo "4. Set up your MySQL database and run: npm run db:setup:production"
echo "5. Install dependencies on server: npm install --production"
echo "6. Start the application: npm run start:production"
echo ""
print_warning "Remember to configure SSL certificate for HTTPS"
print_warning "Update DNS records to point to your server"
print_warning "Configure firewall to allow ports 80, 443, and 4000"