#!/bin/bash

# Create necessary directories
mkdir -p backend/logs
mkdir -p frontend/public

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Create .env file from example
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env file from .env.example. Please update with your configuration."
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install

# Create .env file for frontend
if [ ! -f .env ]; then
  echo "REACT_APP_API_URL=http://localhost:3000/api" > .env
  echo "Created .env file for frontend."
fi

# Return to root directory
cd ..

echo "Setup completed successfully!"
echo "To start the application:"
echo "1. Update the .env files in both frontend and backend directories"
echo "2. Start the backend server: cd backend && npm run dev"
echo "3. Start the frontend server: cd frontend && npm start" 