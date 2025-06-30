@echo off
REM =================================================================
REM  Project Runner Script for Note.js
REM  This script sets up environment variables and starts the
REM  backend (API) and/or frontend servers.
REM =================================================================

REM --- Step 1: Set Default Environment Variables ---
REM If the environment variables are not already set in your system,
REM this script will use these default values for this session.
echo Checking for api\.env file...

IF EXIST api\.env (
    echo   Found api\.env file. The application will use its variables.
    REM If the .env file exists, we assume the PORT might be defined there.
) ELSE (
    echo   api\.env file not found.
    echo   Setting default environment variables for this session.

    if not defined MONGO_URI (
        set "MONGO_URI=mongodb://localhost:27017/notesdb"
        echo     MONGO_URI not set. Using default: %MONGO_URI%
    ) else (
        echo     MONGO_URI is already set.
    )

    if not defined JWT_SECRET (
        set "JWT_SECRET=this-is-a-super-secret-key-for-dev"
        echo     JWT_SECRET not set. Using default.
    ) else (
        echo     JWT_SECRET is already set.
    )

    if not defined PORT (
        set "PORT=5000"
        echo     API PORT not set. Using default: %PORT%
    ) else (
        echo     API PORT is already set.
    )
)

echo.
echo =================================================================
echo.

:menu
    REM --- Step 2: Present the User with a Choice ---
    echo Please choose which server to run:
    echo   [1] Backend API only (on port %PORT%)
    echo   [2] Frontend Web Server only (on port 8080)
    echo   [3] Both Backend and Frontend (in separate windows)
    echo   [4] Exit
    echo.

    CHOICE /C 1234 /M "Enter your choice: "

    IF ERRORLEVEL 4 GOTO end
    IF ERRORLEVEL 3 GOTO both
    IF ERRORLEVEL 2 GOTO frontend
    IF ERRORLEVEL 1 GOTO backend

:backend
    REM --- Run Backend Only ---
    echo Starting Backend API...
    cd api
    echo Installing dependencies if needed...
    npm install
    echo Starting server with nodemon...
    npm run dev
GOTO end

:frontend
    REM --- Run Frontend Only ---
    REM The 'http-server' package is a simple way to host a static site.
    echo Starting Frontend Web Server...
    cd front-end
    echo Checking for the 'serve' package...

    REM Check if 'http-server' is installed, if not, offer to install it.
    where /q http-server
    if %errorlevel% neq 0 (
        echo 'http-server' package not found. It is required to run the frontend server.
        CHOICE /C YN /M "Do you want to install it globally now? (y/n)"
        if errorlevel 2 (
            echo You can install it manually by running: npm install -g http-server
            goto end
        )
        npm install -g http-server
    )

    echo Starting web server on http://localhost:8080
    http-server -p 8080
GOTO end

:both
    REM --- Run Both Servers ---
    echo Starting both Backend and Frontend servers in separate windows.

    REM Start the Backend API in a new window
    echo Starting Backend API in a new cmd window...
    start "Backend API" cmd /c "cd api && npm install && npm run dev"

    REM Give the backend a moment to start up
    timeout /t 5 >nul

    REM Start the Frontend in a new window
    echo Starting Frontend Web Server in a new cmd window...
    start "Frontend Server" cmd /c "cd front-end && (where /q http-server || npm install -g http-server) && http-server -p 8080"

    echo Both servers have been launched in new windows.
GOTO end

:end
echo.
echo Script finished.
pause
