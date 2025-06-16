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

# Generate Prisma Client with absolute path
echo "Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma || handle_error "Failed to generate Prisma client"

# Run TypeScript compilation
echo "Compiling TypeScript..."
npx tsc || handle_error "Failed to compile TypeScript"

# Compilar seeds manualmente
echo "Compiling seeds..."
npx tsc src/prisma/seeds/categories.ts --outDir dist/prisma/seeds --esModuleInterop || handle_error "Failed to compile categories seed"
npx tsc src/prisma/seeds/barber.ts --outDir dist/prisma/seeds --esModuleInterop || handle_error "Failed to compile barber seed"

# Ejecutar seeds
echo "Running seeds..."
NODE_ENV=production node dist/prisma/seeds/categories.js
NODE_ENV=production node dist/prisma/seeds/barber.js

# Copy Prisma files to dist
echo "Copying Prisma files..."
cp -r prisma/schema.prisma dist/prisma/

# Run database migrations
echo "Running database migrations..."
npx prisma migrate reset --force --skip-seed || handle_error "Failed to reset database"
npx prisma migrate deploy || handle_error "Failed to deploy migrations"

echo "Build process completed" 