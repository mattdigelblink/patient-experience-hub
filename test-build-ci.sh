#!/bin/bash

# CI-Friendly Build Test Script for Patient Experience Hub
# This version is optimized for CI/CD pipelines (no colors, minimal output)

set -e  # Exit on error

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Starting build test..."

# Check Node.js and npm
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed"; exit 1; }

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci || npm install
fi

# Run linting
echo "Running linting..."
npm run lint

# Check TypeScript types
echo "Checking TypeScript types..."
npx tsc --noEmit

# Clean and build
echo "Cleaning previous build..."
rm -rf .next

echo "Building application..."
npm run build

# Verify build output
if [ ! -d ".next" ]; then
    echo "Error: Build output directory not found"
    exit 1
fi

echo "Build test completed successfully!"

exit 0
