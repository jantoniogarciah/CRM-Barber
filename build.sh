#!/bin/bash

# Print current directory
echo "Current directory: $(pwd)"

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Navigate to backend and run its build script
echo "Building backend..."
cd backend
npm install
chmod +x build.sh
./build.sh

# Copy Prisma client to root node_modules
echo "Copying Prisma client to root..."
cd ..
rm -rf node_modules/@prisma/client
mkdir -p node_modules/@prisma
cp -r backend/node_modules/@prisma/client node_modules/@prisma/

# Create empty prisma directory and schema to satisfy Render
echo "Creating placeholder Prisma schema..."
mkdir -p prisma
touch prisma/schema.prisma

echo "Build process completed" 