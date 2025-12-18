@echo off
REM MyEagle Backend - Setup Script for Windows
REM This script installs dependencies and configures the environment

setlocal enabledelayedexpansion

echo.
echo ================================================
echo MyEagle Backend - Setup
echo ================================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required but not installed
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo 1. Download the LTS version
    echo 2. Run the installer
    echo 3. Accept all defaults
    echo 4. Restart this command prompt
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version

echo [OK] npm is installed
npm --version

echo.
echo ================================================
echo Installing npm dependencies...
echo ================================================
echo.

call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ================================================
echo Setting up environment variables...
echo ================================================
echo.

REM Check if .env exists
if exist ".env" (
    echo [OK] .env file already exists
    echo You can edit it with: notepad .env
) else (
    echo [*] Creating .env file from template...
    copy ".env.example" ".env" >nul
    echo [OK] .env file created
    echo [!] Please edit .env and add your API keys:
    echo     - AMADEUS_API_KEY
    echo     - AMADEUS_API_SECRET
    echo     - STRIPE_SECRET_KEY
    echo.
    echo You can edit it with: notepad .env
)

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Edit .env file with your API keys (optional for testing)
echo 2. Run: start-server.bat
echo 3. Visit: http://localhost:3001
echo.
echo For more information, see README.md
echo.
pause
exit /b 0
