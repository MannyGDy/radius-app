#!/bin/bash

# Setup environment variables for Radius-app
echo "Setting up environment variables..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=3000
SESSION_SECRET=your-super-secret-session-key-change-this

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=radius
DB_USER=postgres
DB_PASSWORD=your_database_password

# RADIUS Configuration
RADIUS_SERVER=127.0.0.1
RADIUS_PORT=1812
RADIUS_SECRET=testing123

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Optional: NODE_ENV
NODE_ENV=development
EOF
    echo ".env file created successfully!"
else
    echo ".env file already exists"
fi

# Set environment variables for current session
export RADIUS_SERVER=127.0.0.1
export RADIUS_PORT=1812
export RADIUS_SECRET=testing123

echo "Environment variables set:"
echo "- RADIUS_SERVER: $RADIUS_SERVER"
echo "- RADIUS_PORT: $RADIUS_PORT"
echo "- RADIUS_SECRET: $RADIUS_SECRET"

echo ""
echo "You can now start the server with:"
echo "npm start"
echo ""
echo "Or test the RADIUS configuration with:"
echo "curl http://localhost:3000/api/auth/test-radius"
