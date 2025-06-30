#!/bin/bash
# =================================================================
#  Project Runner Script for Note.js (Linux/macOS)
#  This script sets up environment variables and starts the
#  backend (API) and/or frontend servers.
# =================================================================

# --- Step 1: Set Default Environment Variables ---
# If an api/.env file doesn't exist, this script will export
# default values for the current session.
echo "Checking for api/.env file..."

if [ -f "api/.env" ]; then
    echo "  Found api/.env file. The application will use its variables."
    # If the .env file exists, node app will pick it up via dotenv.
    # We still check for a PORT variable for the menu display.
    export PORT=${PORT:-5000}
else
    echo "  api/.env file not found."
    echo "  Setting default environment variables for this session."
    export MONGO_URI=${MONGO_URI:-"mongodb://localhost:27017/notesdb"}
    export JWT_SECRET=${JWT_SECRET:-"this-is-a-super-secret-key-for-dev"}
    export PORT=${PORT:-5000}
    echo "    MONGO_URI: $MONGO_URI"
    echo "    JWT_SECRET: A default secret will be used."
    echo "    API PORT:  $PORT"
fi

echo ""
echo "================================================================="
echo ""

# --- Helper Functions ---
start_backend() {
    echo "Starting Backend API..."
    cd api || exit
    echo "Installing dependencies if needed..."
    npm install
    echo "Starting server with nodemon..."
    npm run dev
}

start_frontend() {
    echo "Starting Frontend Web Server..."
    cd front-end || exit

    # Check if the 'http-server' command is available
    if ! command -v http-server &> /dev/null; then
        echo "'http-server' package not found. It is required to run the frontend server."
        read -p "Do you want to install it globally now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Installing 'http-server' globally..."
            npm install -g http-server
        else
            echo "Please install 'http-server' manually by running: npm install -g http-server"
            exit 1
        fi
    fi

    echo "Starting web server on http://localhost:8080"
    http-server . -p 8080
}

# --- Main Menu Loop ---
while true; do
    echo "Please choose which server to run:"
    echo "  [1] Backend API only (on port $PORT)"
    echo "  [2] Frontend Web Server only (on port 8080)"
    echo "  [3] Both Backend and Frontend (run in this terminal)"
    echo "  [4] Exit"
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
            sleep 5 # Give backend time to initialize
            start_frontend
            # Kill the background backend process when frontend is stopped
            kill $!
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
