@echo off
REM ================================================
REM TEST AFFILIATE + CHATBOT + SUPPORT SYSTEM
REM ================================================
REM Save this as: test-new-features.bat
REM Run: .\test-new-features.bat

setlocal enabledelayedexpansion

echo.
echo ================================================
echo  MYEAGLE - NEW FEATURES TEST SUITE
echo ================================================
echo.
echo Testing: Affiliate Program + Chatbot + Support
echo Server: http://localhost:3001
echo Time: %date% %time%
echo.

REM Color codes
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set RESET=[0m

REM Test 1: Affiliate Registration
echo %BLUE%[1/8] Testing Affiliate Registration...%RESET%
curl -s -X POST http://localhost:3001/api/affiliate/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"blogger@example.com\",\"name\":\"Travel Blogger\",\"website\":\"travelblogs.com\",\"bankAccount\":\"1234567890\"}" ^
  | findstr /C:"affiliateId" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Affiliate Registration Working%RESET%
) else (
  echo %RED%[FAIL] Affiliate Registration%RESET%
)
echo.

REM Test 2: Chatbot Message
echo %BLUE%[2/8] Testing Chatbot...%RESET%
curl -s -X POST http://localhost:3001/api/chatbot/message ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"USER-123\",\"message\":\"How do I book a flight?\"}" ^
  | findstr /C:"botResponse" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Chatbot Working%RESET%
) else (
  echo %RED%[FAIL] Chatbot%RESET%
)
echo.

REM Test 3: Support Ticket Creation
echo %BLUE%[3/8] Testing Support Ticket Creation...%RESET%
curl -s -X POST http://localhost:3001/api/support/ticket ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\":\"USER-123\",\"email\":\"user@example.com\",\"issue\":\"payment_failed\",\"description\":\"Card declined\"}" ^
  | findstr /C:"ticketId" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Support Ticket Creation Working%RESET%
) else (
  echo %RED%[FAIL] Support Ticket Creation%RESET%
)
echo.

REM Test 4: Affiliate Dashboard
echo %BLUE%[4/8] Testing Affiliate Dashboard...%RESET%
curl -s http://localhost:3001/api/affiliate/top ^
  | findstr /C:"topAffiliates" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Affiliate Dashboard Working%RESET%
) else (
  echo %RED%[FAIL] Affiliate Dashboard%RESET%
)
echo.

REM Test 5: Chatbot History
echo %BLUE%[5/8] Testing Chatbot History...%RESET%
curl -s http://localhost:3001/api/chatbot/history/USER-123 ^
  | findstr /C:"conversations" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Chatbot History Working%RESET%
) else (
  echo %RED%[FAIL] Chatbot History%RESET%
)
echo.

REM Test 6: Chatbot Stats
echo %BLUE%[6/8] Testing Chatbot Stats...%RESET%
curl -s http://localhost:3001/api/chatbot/stats ^
  | findstr /C:"stats" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Chatbot Stats Working%RESET%
) else (
  echo %RED%[FAIL] Chatbot Stats%RESET%
)
echo.

REM Test 7: Support Dashboard
echo %BLUE%[7/8] Testing Support Dashboard...%RESET%
curl -s http://localhost:3001/api/support/dashboard ^
  | findstr /C:"dashboard" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Support Dashboard Working%RESET%
) else (
  echo %RED%[FAIL] Support Dashboard%RESET%
)
echo.

REM Test 8: Health Check (Original)
echo %BLUE%[8/8] Testing Health Check...%RESET%
curl -s http://localhost:3001 ^
  | findstr /C:"MyEagle" > nul
if !errorlevel! equ 0 (
  echo %GREEN%[PASS] Health Check Working%RESET%
) else (
  echo %RED%[FAIL] Health Check%RESET%
)
echo.

echo ================================================
echo  TEST SUITE COMPLETE
echo ================================================
echo.
echo Next Steps:
echo 1. Check data/affiliates.json for affiliate records
echo 2. Check data/conversations.json for chat history
echo 3. Check data/support-tickets.json for tickets
echo.
echo For detailed testing, see: INTEGRATION_GUIDE.md
echo.
pause
