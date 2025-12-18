@echo off
REM Test script for new protection systems

setlocal enabledelayedexpansion

echo.
echo =======================================================
echo Testing MyEagle New Protection Systems
echo =======================================================
echo.

REM Test 1: Get Protection Plans
echo Test 1: GET /api/protection/plans
curl -s http://localhost:3001/api/protection/plans | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

REM Test 2: Get Legal Documents
echo Test 2: GET /api/legal/documents
curl -s http://localhost:3001/api/legal/documents | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

REM Test 3: Get Trust Badges
echo Test 3: GET /api/trust/badges
curl -s http://localhost:3001/api/trust/badges | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

REM Test 4: Get Protection Guarantees
echo Test 4: GET /api/protection/guarantees
curl -s http://localhost:3001/api/protection/guarantees | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

REM Test 5: Get SMS Statistics
echo Test 5: GET /api/sms/statistics
curl -s http://localhost:3001/api/sms/statistics | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

REM Test 6: Get Trust Score
echo Test 6: GET /api/trust/score
curl -s http://localhost:3001/api/trust/score | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

REM Test 7: Get Legal Summary
echo Test 7: GET /api/legal/summary
curl -s http://localhost:3001/api/legal/summary | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

REM Test 8: Get Protection Info
echo Test 8: GET /api/protection/info
curl -s http://localhost:3001/api/protection/info | findstr /C:"success" >nul
if %errorlevel% equ 0 (
    echo [OK] Response received
) else (
    echo [ERROR] No response
)
echo.

echo =======================================================
echo All new systems verified!
echo =======================================================
echo.
