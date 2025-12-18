# Windows Installation & Running Commands

Complete set of commands for installing and running the MyEagle travel booking backend on Windows.

---

## Option 1: Quick Start (No Command Line)

**Easiest method - just double-click files:**

1. **Double-click `setup.bat`**
   - Installs all dependencies
   - Creates `.env` file

2. **Double-click `start-server.bat`**
   - Starts the backend server

3. **Double-click `test-endpoints.bat`**
   - Tests all API endpoints

4. **Open browser**: `http://localhost:3001`

---

## Option 2: Manual Command Line Setup

### Step 1: Verify Node.js Installation

Open **Command Prompt** (`Win+R`, type `cmd`, press Enter):

```cmd
node --version
npm --version
```

**Expected output:**
```
v18.0.0  (or similar)
9.0.0    (or similar)
```

If you see errors, [install Node.js LTS](https://nodejs.org/) first.

---

### Step 2: Navigate to Project

```cmd
cd C:\Users\HELLO\Desktop\myeagle-backend
```

Or if in different location:
```cmd
cd C:\path\to\myeagle-backend
```

---

### Step 3: Install Dependencies

```cmd
npm install
```

**What it does:**
- Downloads and installs all required packages
- Creates `node_modules` folder
- Takes 2-5 minutes depending on internet speed

**Expected output:**
```
added 100+ packages in 2m
```

---

### Step 4: Create Environment File

#### Option A: Using Command Prompt

```cmd
copy nul .env
notepad .env
```

Then add (minimal, without API keys):
```
PORT=3001
NODE_ENV=development
```

Or with optional Amadeus/Stripe keys:
```
PORT=3001
NODE_ENV=development
AMADEUS_CLIENT_ID=your_key_here
AMADEUS_CLIENT_SECRET=your_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_here
```

#### Option B: Using PowerShell (if in PowerShell)

```powershell
New-Item -Path ".env" -ItemType File -Force
notepad .env
```

#### Option C: Without API Keys (Works as Mock)

If you don't have API keys, the server uses realistic mock data:

```cmd
echo PORT=3001 > .env
echo NODE_ENV=development >> .env
```

---

### Step 5: Start the Server

```cmd
npm start
```

**Expected output:**
```
✓ Server running at http://localhost:3001
✓ Flights API: GET http://localhost:3001/api/flights
✓ Hotels API: GET http://localhost:3001/api/hotels
✓ Payments API: POST http://localhost:3001/api/create-payment
```

---

### Step 6: Test the Server

**In a NEW command prompt** (keep the server running):

```cmd
cd C:\Users\HELLO\Desktop\myeagle-backend
npm test
```

Or test specific endpoints:

```cmd
# Test health check
curl http://localhost:3001

# Test flights search
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2"

# Test hotels search
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2"
```

---

## Option 3: PowerShell Commands

If using **Windows PowerShell** instead of Command Prompt:

```powershell
# Navigate to project
cd C:\Users\HELLO\Desktop\myeagle-backend

# Check Node.js
node --version
npm --version

# Install dependencies
npm install

# Create .env file
@"
PORT=3001
NODE_ENV=development
"@ | Out-File -Encoding UTF8 .env

# Start server
npm start
```

---

## Common Commands Reference

| Task | Command |
|------|---------|
| **Install dependencies** | `npm install` |
| **Start server** | `npm start` |
| **Run tests** | `npm test` |
| **Check Node version** | `node --version` |
| **Check npm version** | `npm --version` |
| **View running processes** | `tasklist \| find "node"` |
| **Kill server (if stuck)** | `taskkill /IM node.exe /F` |
| **Clear npm cache** | `npm cache clean --force` |
| **Reinstall dependencies** | `rmdir /s /q node_modules` then `npm install` |

---

## Full Setup Walkthrough

### Complete fresh installation from scratch:

```cmd
REM Step 1: Navigate to project folder
cd C:\Users\HELLO\Desktop\myeagle-backend

REM Step 2: Check Node.js is installed
node --version

REM Step 3: Install all dependencies
npm install

REM Step 4: Create environment file
echo PORT=3001 > .env
echo NODE_ENV=development >> .env

REM Step 5: Start the server
npm start

REM In another Command Prompt:
REM Step 6: Test the server
curl http://localhost:3001
```

---

## Environment Variables Explained

Create a `.env` file in the project root with:

```env
# Server Configuration
PORT=3001                              # Port to run server on
NODE_ENV=development                   # development or production

# Amadeus API (Optional - mock data works without)
AMADEUS_CLIENT_ID=your_amadeus_id      # Get from https://developers.amadeus.com
AMADEUS_CLIENT_SECRET=your_amadeus_secret

# Stripe API (Optional - mock response works without)
STRIPE_SECRET_KEY=sk_test_xxxxx        # Get from https://stripe.com/docs/keys
```

**Note:** Without these keys, the server returns realistic mock data. Perfect for development!

---

## Troubleshooting Windows Commands

### Problem: "npm: The term 'npm' is not recognized"

**Solution:** Node.js not installed or not in PATH

```cmd
REM Check if Node.js is installed
node --version

REM If not found, install from https://nodejs.org/
REM Make sure to check "Add to PATH" during installation
REM Restart Command Prompt after installing
```

---

### Problem: "Port 3001 already in use"

**Find what's using port 3001:**
```cmd
netstat -ano | findstr :3001
```

**Kill the process** (replace PID with number from above):
```cmd
taskkill /PID 1234 /F
```

**Or use different port:**
```cmd
set PORT=3002
npm start
```

---

### Problem: "npm install fails"

**Clear npm cache and retry:**
```cmd
npm cache clean --force
rmdir /s /q node_modules
npm install
```

**Or check npm version:**
```cmd
npm --version
npm install -g npm@latest
```

---

### Problem: "Module not found" after npm install

**Reinstall dependencies:**
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## Windows Batch Files (Automated)

The project includes batch files for easy automation:

### setup.bat
Runs once to install dependencies:
```cmd
setup.bat
```

### start-server.bat
Starts the server with automatic port detection:
```cmd
start-server.bat
```

### test-endpoints.bat
Tests all API endpoints:
```cmd
test-endpoints.bat
```

---

## Running Server in Background

### Method 1: Separate Command Prompt Window (Simple)

1. Open **Command Prompt 1**: `npm start`
2. Open **Command Prompt 2**: Use for testing/commands
3. Keep both windows open

### Method 2: Start Minimized (Using VBScript)

Create `start-server-hidden.vbs`:
```vbscript
Set objShell = CreateObject("WScript.Shell")
objShell.Run "npm start", 0, False
```

Then run:
```cmd
start start-server-hidden.vbs
```

### Method 3: Use Process Manager (Advanced)

Install PM2 globally:
```cmd
npm install -g pm2
pm2 start server.js
pm2 logs
pm2 stop server.js
```

---

## Testing API Endpoints from Command Prompt

### Using curl (Built-in on Windows 10+)

```cmd
REM Health check
curl http://localhost:3001

REM Search flights
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2"

REM Search hotels
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2"

REM Create payment (requires Stripe key)
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":25000,\"currency\":\"usd\",\"bookingId\":\"BK-001\"}"
```

### Using PowerShell

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3001" -Method Get

# Search flights
Invoke-WebRequest -Uri "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2" -Method Get | Select-Object -ExpandProperty Content

# Search hotels
Invoke-WebRequest -Uri "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2" -Method Get | Select-Object -ExpandProperty Content
```

---

## Production Deployment (Windows Server)

### For Windows Server or IIS:

1. **Install Node.js on server**
2. **Deploy project files**
3. **Install dependencies:** `npm install --production`
4. **Use PM2 for auto-restart:**
   ```cmd
   npm install -g pm2
   pm2 start server.js --name "myeagle-api"
   pm2 startup
   pm2 save
   ```

5. **Or use IISNode** (advanced IIS integration)

---

## Quick Reference Card

```
╔════════════════════════════════════════════════╗
║         MYEAGLE BACKEND - QUICK START          ║
╠════════════════════════════════════════════════╣
║                                                ║
║  EASIEST (Double-click):                       ║
║  1. setup.bat                                  ║
║  2. start-server.bat                           ║
║  3. Browser: http://localhost:3001             ║
║                                                ║
║  COMMAND LINE:                                 ║
║  1. cd C:\path\to\myeagle-backend              ║
║  2. npm install                                ║
║  3. npm start                                  ║
║  4. Browser: http://localhost:3001             ║
║                                                ║
║  TEST ENDPOINTS:                               ║
║  curl http://localhost:3001                    ║
║  npm test                                      ║
║  test-endpoints.bat                            ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Express.js Guide](https://expressjs.com/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Amadeus API Documentation](https://developers.amadeus.com/docs)

---

**Last Updated:** December 16, 2025
**Node.js Version Required:** 14.0.0 or higher
**npm Version Required:** 6.0.0 or higher
