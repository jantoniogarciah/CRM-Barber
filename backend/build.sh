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

# Compile TypeScript
echo "Compiling TypeScript..."
npm run build || handle_error "Failed to compile TypeScript"

# Compile migration script
echo "Compiling migration script..."
npx tsc prisma/migrate.ts --outDir dist/prisma --esModuleInterop || handle_error "Failed to compile migration script"

# Copy Prisma files to dist
echo "Copying Prisma files..."
mkdir -p dist/prisma
cp -r prisma/* dist/prisma/

# Run database migrations and seeds
echo "Running database migrations and seeds..."
npx prisma migrate deploy || handle_error "Failed to run migrations"
NODE_ENV=production node dist/prisma/migrate.js || handle_error "Failed to run seeds"

echo "Build process completed successfully"

# Generar tipos de Prisma
npx prisma generate

# Limpiar directorio de compilación
rm -rf dist

# Compilar TypeScript
npm run compile

# Copiar archivos de Prisma
mkdir -p dist/prisma
cp -r prisma/* dist/prisma/

# Ejecutar migraciones
npm run migrate

if [ $? -eq 0 ]; then
    echo "==> Build completed successfully! 🎉"
    exit 0
else
    echo "==> Build failed 😞"
    echo "==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys"
    exit 1
fi 