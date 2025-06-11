#!/bin/bash

# Print current directory
echo "Current directory: $(pwd)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma Client with absolute path
echo "Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

# Run TypeScript compilation
echo "Compiling TypeScript..."
npx tsc

echo "Build process completed" 