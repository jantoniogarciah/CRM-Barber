#!/bin/bash

# Print current directory
echo "Current directory: $(pwd)"

# Install dependencies
npm install

# Generate Prisma Client with absolute path
echo "Generating Prisma Client..."
npx prisma generate --schema=$(pwd)/prisma/schema.prisma

# Run TypeScript compilation
echo "Compiling TypeScript..."
npm run build

echo "Build process completed" 