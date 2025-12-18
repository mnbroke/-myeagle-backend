# Windows Installation & Setup Guide

Complete guide for getting the MyEagle backend running on Windows.

## Quick Start (Easiest)

1. **Extract the project folder**
2. **Run setup.bat** (double-click):
   ```
   setup.bat
   ```
3. **Edit .env file** (add API keys if you have them):
   ```
   notepad .env
   ```
4. **Run start-server.bat** (double-click):
   ```
   start-server.bat
   ```
5. **Open browser**:
   ```
   http://localhost:3001
   ```

Done! Your backend is running.

---

## Prerequisites

### Node.js Installation

1. Download from [nodejs.org](https://nodejs.org)
2. Choose **LTS** version (recommended)
3. Run the installer
4. **IMPORTANT**: Check ✓ "Add to PATH" during installation
5. Click "Install"
6. Restart your computer (or just restart command prompt)

### Verify Installation

Open **Command Prompt** and type:
```cmd
node --version
npm --version
```

You should see version numbers. If not, Node.js isn't installed correctly.

---

## Detailed Setup Steps

### Step 1: Navigate to Project Folder

Open **Command Prompt** and type:
```cmd
cd C:\Users\HELLO\Desktop\myeagle-backend
```

Or simply open the folder in Explorer, right-click in empty space, select "Open in Terminal" (Windows 11) or "Open Command Prompt Here" (Windows 10).

### Step 2: Install Dependencies

```cmd
npm install
```

This will download and install all required packages (express, stripe, amadeus, etc.). Takes 1-2 minutes.

**If you get PowerShell errors**, use this instead:
```cmd
cmd /c npm install
```

### Step 3: Create Environment File

The `.env.example` file exists. Copy it:

**Option A - Using Command Prompt**:
```cmd
copy .env.example .env
```

**Option B - Using File Explorer**:
1. Right-click `.env.example`
2. Copy
3. Right-click in folder
4. Paste
5. Rename to `.env`

### Step 4: Configure API Keys (Optional)

Open the `.env` file with Notepad:
```cmd
notepad .env
```

If you have API keys, add them. If not, the server uses mock data:

```
PORT=3001
NODE_ENV=development
AMADEUS_API_KEY=your_key_here
AMADEUS_API_SECRET=your_secret_here
STRIPE_SECRET_KEY=your_stripe_key_here
```

Save and close (Ctrl+S, then close window).

### Step 5: Start the Server

**Option A - Using Batch File (Easiest)**:
Double-click `start-server.bat`

**Option B - Using Command Prompt**:
```cmd
npm start
```

You should see:
```
==================================================
[✓] Server running on http://localhost:3001
[✓] Environment: development
[✓] Timestamp: 2025-12-16T...
==================================================
```

The server is now running!

---

## Testing the Backend

### Method 1: Using Browser

Visit these URLs in your browser:

1. **Health Check**:
   ```
   http://localhost:3001/
   ```
   Should show JSON with status "ok"

2. **Search Flights**:
   ```
   http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1
   ```
   Should show flight data

3. **Search Hotels**:
   ```
   http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1
   ```
   Should show hotel data

### Method 2: Using Command Prompt

Run the test script:
```cmd
test-endpoints.bat
```

This automatically tests all endpoints and shows results.

### Method 3: Using curl Command

```cmd
# Health check
curl http://localhost:3001/

# Flights
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1"

# Hotels
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1"
```

---

## Troubleshooting

### Issue: "node: command not found"

**Problem**: Node.js isn't installed or not in PATH

**Solution**:
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Make sure to check "Add to PATH"
3. Restart Command Prompt
4. Try again

### Issue: "Port 3001 already in use"

**Problem**: Another process is using port 3001

**Solution**:
```cmd
REM Find what's using port 3001
netstat -ano | findstr :3001

REM Kill the process (replace 12345 with PID from above)
taskkill /PID 12345 /F
```

Or use a different port:
```cmd
set PORT=3002
npm start
```

### Issue: npm install fails with PowerShell error

**Problem**: PowerShell execution policy blocks npm

**Solution**:
```cmd
REM Use cmd instead of PowerShell
cmd /c npm install
```

Or use the batch files provided (they use cmd automatically).

### Issue: "dependencies missing"

**Problem**: node_modules folder deleted or incomplete

**Solution**:
```cmd
npm install
```

### Issue: Requests return error 500

**Problem**: Could be API credentials issue

**Check**:
1. Open server terminal
2. Look for error messages
3. Check `.env` file is properly formatted
4. Verify Stripe/Amadeus credentials if configured

---

## Stopping the Server

Press **Ctrl+C** in the Command Prompt where the server is running.

---

## Useful Commands

### Restart Node Modules
```cmd
rmdir /s /q node_modules
npm install
```

### Check Port Status
```cmd
netstat -ano | findstr :3001
```

### Start on Different Port
```cmd
set PORT=3002
npm start
```

### View Server Logs
Server logs are shown in the Command Prompt window while it's running.

---

## File Structure

```
myeagle-backend/
├── server.js                    # Main server
├── package.json               # Dependencies
├── .env                       # Your API keys (create from .env.example)
├── .env.example              # Template
├── README.md                 # Full documentation
├── RENDER_DEPLOYMENT.md      # Deployment guide
├── TROUBLESHOOTING.md        # Troubleshooting
├── SETUP_COMPLETE.md         # Setup verification
├── setup.bat                 # Setup script
├── start-server.bat          # Start server
├── test-endpoints.bat        # Test endpoints
├── public/
│   └── stripe-payment-component.html
└── base44-actions/
    ├── flights-search.js
    ├── hotels-search.js
    └── create-payment-intent.js
```

---

## Next Steps

1. **Test locally** - Use test-endpoints.bat or browser
2. **Get API keys** (optional):
   - Amadeus: [developers.amadeus.com](https://developers.amadeus.com)
   - Stripe: [stripe.com](https://stripe.com)
3. **Update .env** with credentials
4. **Deploy to Render** (optional) - See RENDER_DEPLOYMENT.md
5. **Integrate with Base44** - Use custom actions

---

## Windows PowerShell Issues

If you get PowerShell execution policy errors:

**Cause**: Windows PowerShell has execution policy restrictions

**Solution**: Use Command Prompt (cmd.exe) instead
- The batch files (setup.bat, start-server.bat) use cmd automatically
- Or run: `cmd /c npm install`

**Or enable PowerShell** (requires Admin):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Performance Tips

- **For development**: Server is fast enough on localhost
- **For production**: Use Render.com (see RENDER_DEPLOYMENT.md)
- **API calls**: First call slower (Amadeus/Stripe connection), subsequent faster (caching)

---

## Getting Help

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - answers 90% of issues
2. Run `test-endpoints.bat` - shows if backend is working
3. Check server console - error messages are there
4. See [README.md](README.md) - full API documentation

---

## Summary

You now have a fully functional travel booking backend on Windows:
- ✅ Flight search (with mock data fallback)
- ✅ Hotel search (with mock data fallback)
- ✅ Payment processing (Stripe)
- ✅ CORS for Base44
- ✅ Error handling
- ✅ Easy startup scripts

**Enjoy your MyEagle backend!**
