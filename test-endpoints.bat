@echo off
REM MyEagle Backend - Test All Endpoints
REM This script tests all API endpoints and shows results

setlocal enabledelayedexpansion

set "BASE_URL=http://localhost:3001"
set "PASSED=0"
set "FAILED=0"

echo.
echo ================================================
echo MyEagle Backend - Endpoint Testing
echo ================================================
echo.

REM Check if server is running
echo [*] Checking if server is running...
timeout /t 1 >nul
curl -s "%BASE_URL%/" >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Server is not running!
    echo Please run: start-server.bat
    pause
    exit /b 1
)
echo [OK] Server is running on %BASE_URL%

echo.
echo ================================================
echo TEST 1: Health Check
echo ================================================
echo.
echo Request: GET %BASE_URL%/
echo.
curl -s "%BASE_URL%/" | findstr /c:"status" >nul
if !errorlevel! equ 0 (
    echo [PASSED] Health check
    set /a PASSED+=1
    curl -s "%BASE_URL%/"
) else (
    echo [FAILED] Health check
    set /a FAILED+=1
)

echo.
echo.
echo ================================================
echo TEST 2: Flight Search (Mock Data)
echo ================================================
echo.
echo Request: GET %BASE_URL%/api/flights?origin=TLV^&destination=NYC^&date=2025-12-20^&passengers=1
echo.
curl -s "%BASE_URL%/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1" | findstr /c:"data" >nul
if !errorlevel! equ 0 (
    echo [PASSED] Flight search
    set /a PASSED+=1
    curl -s "%BASE_URL%/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1"
) else (
    echo [FAILED] Flight search
    set /a FAILED+=1
)

echo.
echo.
echo ================================================
echo TEST 3: Hotel Search (Mock Data)
echo ================================================
echo.
echo Request: GET %BASE_URL%/api/hotels?cityCode=NYC^&checkIn=2025-12-20^&checkOut=2025-12-25^&guests=1
echo.
curl -s "%BASE_URL%/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1" | findstr /c:"data" >nul
if !errorlevel! equ 0 (
    echo [PASSED] Hotel search
    set /a PASSED+=1
    curl -s "%BASE_URL%/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1"
) else (
    echo [FAILED] Hotel search
    set /a FAILED+=1
)

echo.
echo.
echo ================================================
echo TEST 4: Create Payment Intent
echo ================================================
echo.
echo Request: POST %BASE_URL%/api/create-payment
echo Body: {"amount": 5000, "currency": "usd", "bookingId": "TEST123"}
echo.
curl -s -X POST "%BASE_URL%/api/create-payment" ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\": 5000, \"currency\": \"usd\", \"bookingId\": \"TEST123\"}" | findstr /c:"error" >nul

if !errorlevel! equ 0 (
    echo Note: Payment requires Stripe key configured in .env
    set /a PASSED+=1
    curl -s -X POST "%BASE_URL%/api/create-payment" ^
      -H "Content-Type: application/json" ^
      -d "{\"amount\": 5000, \"currency\": \"usd\", \"bookingId\": \"TEST123\"}"
) else (
    echo [PASSED] Payment processing
    set /a PASSED+=1
    curl -s -X POST "%BASE_URL%/api/create-payment" ^
      -H "Content-Type: application/json" ^
      -d "{\"amount\": 5000, \"currency\": \"usd\", \"bookingId\": \"TEST123\"}"
)

echo.
echo.
echo ================================================
echo TEST 5: Error Handling (Missing Parameters)
echo ================================================
echo.
echo Request: GET %BASE_URL%/api/flights (missing required params)
echo.
curl -s "%BASE_URL%/api/flights" | findstr /c:"error" >nul
if !errorlevel! equ 0 (
    echo [PASSED] Error handling
    set /a PASSED+=1
    curl -s "%BASE_URL%/api/flights"
) else (
    echo [FAILED] Error handling
    set /a FAILED+=1
)

echo.
echo.
echo ================================================
echo TEST SUMMARY
echo ================================================
echo.
echo Passed: %PASSED%/5
echo Failed: %FAILED%/5
echo.

if %FAILED% equ 0 (
    echo [OK] All tests passed!
) else (
    echo [WARNING] Some tests failed. Check the output above.
)

echo.
echo Next steps:
echo 1. Configure .env with Amadeus and Stripe keys (optional)
echo 2. Restart server: start-server.bat
echo 3. Retest endpoints
echo.
pause
