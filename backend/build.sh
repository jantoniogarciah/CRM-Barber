#!/bin/bash

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Print current directory
echo "Current directory: $(pwd)"

# Install dependencies
echo "Installing dependencies..."
npm install || handle_error "Failed to install dependencies"

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate || handle_error "Failed to generate Prisma client"

# Clean dist directory
echo "Cleaning dist directory..."
rm -rf dist || handle_error "Failed to clean dist directory"

# Compile TypeScript
echo "Compiling TypeScript..."
npx tsc || handle_error "Failed to compile TypeScript"

# Copy Prisma files
echo "Copying Prisma files..."
mkdir -p dist/prisma
cp -r prisma/* dist/prisma/ || handle_error "Failed to copy Prisma files"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || handle_error "Failed to run migrations"

if [ $? -eq 0 ]; then
    echo "==> Build completed successfully! 🎉"
    exit 0
else
    echo "==> Build failed 😞"
    echo "==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys"
    exit 1
fi 