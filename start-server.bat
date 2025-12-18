@echo off
REM MyEagle Backend - Windows Startup Script
REM This script starts the Node.js server on port 3001

setlocal enabledelayedexpansion

echo.
echo ================================================
echo MyEagle Backend - Travel Booking System
echo ================================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo [!] node_modules not found. Installing dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
)

echo.
echo [OK] Node.js version:
call node --version

echo [OK] npm version:
call npm --version

echo.
echo Checking for port conflicts on 3001...
netstat -ano | findstr :3001 >nul 2>nul
if !errorlevel! equ 0 (
    echo [WARNING] Port 3001 is already in use
    echo Killing existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>nul
    )
    timeout /t 1 >nul
)

echo.
echo ================================================
echo Starting MyEagle Backend Server...
echo ================================================
echo.

REM Start the server
node server.js

REM If server exits, show message
echo.
echo Server stopped. Press any key to exit...
pause
exit /b 0
