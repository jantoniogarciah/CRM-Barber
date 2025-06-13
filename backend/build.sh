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

# Compilar seeds manualmente
npx tsc src/prisma/seeds/categories.ts --outDir dist/prisma/seeds

# Ejecutar seeds
NODE_ENV=production node dist/prisma/seeds/categories.js

# Copy Prisma files to dist
echo "Copying Prisma files..."
cp -r prisma/schema.prisma dist/prisma/

# Run database migrations
echo "Running database migrations..."
NODE_ENV=production node dist/prisma/migrate.js

echo "Build process completed" 