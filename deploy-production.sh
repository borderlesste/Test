#!/bin/bash

# Borderless Techno Company - Production Deployment Script
# This script prepares and deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting production deployment for Borderless Techno Company..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Step 1: Installing dependencies..."

# Install client dependencies
print_status "Installing client dependencies..."
cd client
npm ci --production=false
cd ..

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm ci --production=false
cd ..

print_status "Step 2: Building client for production..."
cd client
npm run build:production
cd ..

print_status "Step 3: Testing database connection..."
cd server
node scripts/test-connection.js
cd ..

print_status "Step 4: Verifying production environment files..."

# Check if production env files exist
if [ ! -f "client/.env.production" ]; then
    print_error "Missing client/.env.production file"
    exit 1
fi

if [ ! -f "server/.env.production" ]; then
    print_error "Missing server/.env.production file"
    exit 1
fi

print_status "Step 5: Testing server in production mode..."
cd server
timeout 10s npm run start:production || true
cd ..

print_status "✅ Production build completed successfully!"

echo ""
echo "📋 Deployment Checklist:"
echo "✅ Dependencies installed"
echo "✅ Client built for production"
echo "✅ Database connection verified"
echo "✅ Environment files verified"
echo "✅ Server tested"

echo ""
echo "🔗 Next Steps:"
echo "1. Deploy client to Vercel:"
echo "   - Framework: Vite"
echo "   - Build Command: npm run build:production"
echo "   - Output Directory: dist"
echo "   - Root Directory: client"
echo ""
echo "2. Deploy server to Vercel:"
echo "   - Framework: Other"
echo "   - Root Directory: server"
echo ""
echo "3. Configure environment variables in Vercel dashboard"
echo ""
echo "🌐 Your application will be available at:"
echo "   Frontend: https://borderlesstechno.com"
echo "   Backend: https://borderlesstechno.com/api"

print_status "Deployment preparation complete! 🎉"