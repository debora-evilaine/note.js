#!/bin/bash
# =================================================================
# Project Runner Script for Node.js (Linux/macOS)
# This script sets up environment variables by ensuring an
# api/.env file exists with default values if not present,
# and then starts the backend (API) and/or frontend servers.
# =================================================================
DEFAULT_MONGO_URI="mongodb://localhost:27017/notesdb"
DEFAULT_JWT_SECRET="this-is-a-super-secret-key-for-dev"
DEFAULT_PORT="5000"
DEFAULT_EMAIL_USER="" # No default, leave empty
DEFAULT_EMAIL_PASS="" # No default, leave empty
DEFAULT_FRONTEND_URL="http://localhost:8080"

export MONGO_URI=${MONGO_URI:-$DEFAULT_MONGO_URI}
export JWT_SECRET=${JWT_SECRET:-$DEFAULT_JWT_SECRET}
export PORT=${PORT:-$DEFAULT_PORT}
export EMAIL_USER=${EMAIL_USER:-$DEFAULT_EMAIL_USER}
export EMAIL_PASS=${EMAIL_PASS:-$DEFAULT_EMAIL_PASS}
export FRONTEND_URL=${FRONTEND_URL:-$DEFAULT_FRONTEND_URL}

echo "Checking for api/.env file..."

ENV_FILE="api/.env"

if [ -f "$ENV_FILE" ]; then
    echo "    Found $ENV_FILE file. The application will use its variables."
    echo "    Note: Any variables explicitly set in your shell environment"
    echo "    before running this script will override values from $ENV_FILE"
    echo "    for the script's internal logic (e.g., displaying ports)."
else
    echo "    $ENV_FILE file not found."
    echo "    Creating $ENV_FILE with default environment variables."
    mkdir -p api 
    cat <<EOF > "$ENV_FILE"
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
PORT=${PORT}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
FRONTEND_URL=${FRONTEND_URL}
EOF
    echo "    $ENV_FILE created with the following defaults:"
    echo "      MONGO_URI: $MONGO_URI"
    echo "      JWT_SECRET: A default secret will be used."
    echo "      API PORT:  $PORT"
    echo "      EMAIL_USER: ${EMAIL_USER:-"Not set (empty)"}"
    echo "      EMAIL_PASS: ${EMAIL_PASS:-"Not set (empty)"}"
    echo "      FRONTEND_URL: $FRONTEND_URL"
fi

echo ""
echo "================================================================="
echo ""

start_backend() {
    echo "Starting Backend API..."
    cd api || { echo "Error: 'api' directory not found. Exiting."; exit 1; }
    echo "Installing dependencies if needed..."
    npm install
    echo "Starting server with nodemon..."
    npm run dev
    cd ..
}

start_frontend() {
    echo "Starting Frontend Web Server..."
    cd front-end || { echo "Error: 'front-end' directory not found. Exiting."; exit 1; }

    if ! command -v http-server &> /dev/null; then
        echo "'http-server' package not found. It is required to run the frontend server."
        read -p "Do you want to install it globally now? (y/n) " -n 1 -r
        echo "" 
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Installing 'http-server' globally..."
            npm install -g http-server
        else
            echo "Please install 'http-server' manually by running: npm install -g http-server"
            cd ..
            exit 1
        fi
    fi

    FRONTEND_PORT=$(echo "$FRONTEND_URL" | sed -n 's/.*:\([0-9]\+\)$/\1/p')
    if [ -z "$FRONTEND_PORT" ]; then
        FRONTEND_PORT="8080" 
        echo "Warning: Could not extract port from FRONTEND_URL. Defaulting frontend to port 8080."
    fi

    echo "Starting web server on $FRONTEND_URL (using port $FRONTEND_PORT)"
    npx http-server . -p "$FRONTEND_PORT"
    cd ..
}

while true; do
    echo "Please choose which server to run:"
    echo "    [1] Backend API only (on port $PORT)"
    echo "    [2] Frontend Web Server only (on $FRONTEND_URL)"
    echo "    [3] Both Backend and Frontend (run in this terminal)"
    echo "    [4] Exit"
    echo ""
    read -p "Enter your choice: " choice

    case $choice in
        1)
            start_backend
            break
            ;;
        2)
            start_frontend
            break
            ;;
        3)
            echo "Starting both servers."
            echo "The Backend API will run in the background."
            echo "Press Ctrl+C to stop the Frontend server."
            (start_backend) &
            BACKEND_PID=$!
            sleep 5
            start_frontend
            echo "Killing background backend process (PID: $BACKEND_PID)..."
            kill "$BACKEND_PID" 2>/dev/null
            break
            ;;
        4)
            echo "Exiting."
            break
            ;;
        *)
            echo "Invalid option. Please try again."
            echo ""
            ;;
    esac
done

echo ""
echo "Script finished."
