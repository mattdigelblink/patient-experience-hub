#!/bin/bash

# Build Test Script for Patient Experience Hub
# This script tests the build process to ensure the application compiles successfully

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "=========================================="
echo "  Patient Experience Hub - Build Test"
echo "=========================================="
echo ""

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js version: $NODE_VERSION"

# Check if npm is installed
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm version: $NPM_VERSION"

# Check if dependencies are installed
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
    print_success "Dependencies installed"
else
    print_success "Dependencies found"
fi

# Run linting
echo ""
print_status "Running ESLint..."
if npm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

# Check TypeScript types
echo ""
print_status "Checking TypeScript types..."
if npx tsc --noEmit; then
    print_success "TypeScript type checking passed"
else
    print_error "TypeScript type checking failed"
    exit 1
fi

# Clean previous build
echo ""
print_status "Cleaning previous build..."
rm -rf .next
print_success "Build directory cleaned"

# Run build
echo ""
print_status "Building application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check if build output exists
echo ""
print_status "Verifying build output..."
if [ -d ".next" ]; then
    print_success "Build output directory created"
    
    # Check for critical build files
    if [ -d ".next/standalone" ] || [ -f ".next/BUILD_ID" ]; then
        print_success "Build artifacts found"
    fi
else
    print_error "Build output directory not found"
    exit 1
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}  ✓ Build test completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  - Run 'npm run start' to start the production server"
echo "  - Run 'npm run dev' to start the development server"
echo ""

exit 0
