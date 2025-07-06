@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

REM Store current directory to restore later
SET "ORIGINAL_DIR=%CD%"

REM =================================================================
REM Project Runner Script for Node.js (Windows Batch)
REM =================================================================

SET "DEFAULT_MONGO_URI=mongodb://localhost:27017/notesdb"
SET "DEFAULT_JWT_SECRET=this-is-a-super-secret-key-for-dev"
SET "DEFAULT_PORT=5000"
SET "DEFAULT_EMAIL_USER="
SET "DEFAULT_EMAIL_PASS="
SET "DEFAULT_FRONTEND_URL=http://localhost:8080"

IF NOT DEFINED MONGO_URI SET "MONGO_URI=%DEFAULT_MONGO_URI%"
IF NOT DEFINED JWT_SECRET SET "JWT_SECRET=%DEFAULT_JWT_SECRET%"
IF NOT DEFINED PORT SET "PORT=%DEFAULT_PORT%"
IF NOT DEFINED EMAIL_USER SET "EMAIL_USER=%DEFAULT_EMAIL_USER%"
IF NOT DEFINED EMAIL_PASS SET "EMAIL_PASS=%DEFAULT_EMAIL_PASS%"
IF NOT DEFINED FRONTEND_URL SET "FRONTEND_URL=%DEFAULT_FRONTEND_URL%"

ECHO Checking for api\.env file

SET "ENV_FILE=api\.env"

IF EXIST "%ENV_FILE%" (
    ECHO     Found %ENV_FILE%. Using existing environment variables.
) ELSE (
    ECHO     %ENV_FILE% not found. Creating with default variables
    MD api 2>NUL
    IF NOT EXIST "api\" (
        ECHO Error: Could not create "api" directory.
        EXIT /B 1
    )
    (
        ECHO MONGO_URI=%MONGO_URI%
        ECHO JWT_SECRET=%JWT_SECRET%
        ECHO PORT=%PORT%
        ECHO EMAIL_USER=%EMAIL_USER%
        ECHO EMAIL_PASS=%EMAIL_PASS%
        ECHO FRONTEND_URL=%FRONTEND_URL%
    ) > "%ENV_FILE%"

    ECHO     Created %ENV_FILE% with:
    ECHO       MONGO_URI: %MONGO_URI%
    ECHO       JWT_SECRET: [hidden]
    ECHO       PORT: %PORT%
    ECHO       EMAIL_USER: %EMAIL_USER%
    ECHO       FRONTEND_URL: %FRONTEND_URL%
)

ECHO.
ECHO =================================================================
ECHO.

REM --- Main Menu ---
:menu_loop
ECHO Choose which server to run:
ECHO     [1] Backend API only (port %PORT%)
ECHO     [2] Frontend only (%FRONTEND_URL%)
ECHO     [3] Both Backend and Frontend
ECHO     [4] Exit
ECHO.
SET /P CHOICE="Enter your choice: "

IF "%CHOICE%"=="1" (
    CALL :start_backend
    GOTO :end_script
) ELSE IF "%CHOICE%"=="2" (
    CALL :start_frontend
    GOTO :end_script
) ELSE IF "%CHOICE%"=="3" (
    ECHO Starting both servers
    START "Node.js Backend" cmd /c "CD /D "%CD%\api" && CALL npm install && CALL npm run dev"
    TIMEOUT /T 5 /NOBREAK >NUL
    CALL :start_frontend
    ECHO Attempting to kill all Node.js processes (node.exe)
    TASKKILL /IM node.exe /F >NUL 2>NUL
    GOTO :end_script
) ELSE IF "%CHOICE%"=="4" (
    ECHO Exiting.
    GOTO :end_script
) ELSE (
    ECHO Invalid option. Try again.
    ECHO.
    GOTO :menu_loop
)

:end_script
CD /D "%ORIGINAL_DIR%"
ECHO.
ECHO Script finished.
GOTO :EOF

REM === Backend Start ===
:start_backend
ECHO Starting Backend API
CD /D "%ORIGINAL_DIR%\api" || (ECHO Error: 'api' dir not found. && EXIT /B 1)
CALL npm install
CALL npm run dev
CD /D "%ORIGINAL_DIR%"
GOTO :EOF

REM === Frontend Start ===
:start_frontend
ECHO Starting Frontend Web Server
CD /D "%ORIGINAL_DIR%\front-end" || (ECHO Error: 'front-end' dir not found. && EXIT /B 1)

WHERE http-server >NUL 2>NUL
IF %ERRORLEVEL% NEQ 0 (
    ECHO 'http-server' not found.
    SET /P REPLY="Install 'http-server' globally now? (y/n) "
    IF /I "%REPLY%"=="y" (
        CALL npm install -g http-server
    ) ELSE (
        ECHO Please run: npm install -g http-server
        CD /D "%ORIGINAL_DIR%"
        EXIT /B 1
    )
)

FOR /F "tokens=3 delims=:" %%P IN ("%FRONTEND_URL%") DO SET "FRONTEND_PORT=%%P"
IF NOT DEFINED FRONTEND_PORT SET "FRONTEND_PORT=8080"

ECHO Starting on %FRONTEND_URL% (port %FRONTEND_PORT%)
CALL npx http-server . -p %FRONTEND_PORT%
CD /D "%ORIGINAL_DIR%"
GOTO :EOF
