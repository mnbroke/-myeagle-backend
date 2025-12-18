# Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Server Won't Start

**Error**: `node: command not found` or `npm: command not found`

**Solution**:
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```
3. Restart your terminal
4. Try running the server again

---

### Issue 2: Port 3001 Already in Use

**Error**: `Error: listen EADDRINUSE :::3001`

**Solution**:
```bash
# On Windows - find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Or use a different port
PORT=3002 npm start
```

---

### Issue 3: CORS Errors in Browser

**Error**: `Cross-Origin Request Blocked`

**Symptoms**:
- Base44 page can't reach the backend
- Browser console shows CORS error
- Works on localhost but fails on Base44 domain

**Solution**:

1. Check if backend is running:
   ```bash
   curl http://localhost:3001/
   ```

2. Verify CORS configuration in `server.js`:
   ```javascript
   app.use(cors({
     origin: [
       'https://your-app-name.base44.com',
       'http://localhost:3000'
     ],
     methods: ['GET', 'POST', 'OPTIONS'],
     credentials: true
   }));
   ```

3. Replace `your-app-name` with your actual Base44 app name

4. Restart the server:
   ```bash
   npm start
   ```

---

### Issue 4: Amadeus API Not Working

**Error**: `Failed to fetch flights` or empty results

**Causes**:
- Missing API credentials
- Invalid credentials
- API key restrictions

**Solution**:

1. Check `.env` file has credentials:
   ```bash
   cat .env
   ```

2. Expected format:
   ```
   AMADEUS_API_KEY=your_key_here
   AMADEUS_API_SECRET=your_secret_here
   ```

3. Verify on Amadeus dashboard:
   - Login to [developers.amadeus.com](https://developers.amadeus.com)
   - Check app is **Active**
   - Verify credentials haven't been revoked

4. Server will use **mock data** if credentials are missing (intentional fallback)

---

### Issue 5: Stripe Payment Fails

**Error**: `Failed to create payment intent`

**Causes**:
- Missing or invalid Stripe secret key
- Invalid amount format
- Account restrictions

**Solution**:

1. Verify Stripe key in `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_... (for testing)
   STRIPE_SECRET_KEY=sk_live_... (for production)
   ```

2. Check Stripe Dashboard:
   - Go to [stripe.com](https://stripe.com) → Developers → API Keys
   - Use **Secret Key** (not publishable key)
   - Make sure you're in test mode for development

3. Verify amount format - should be in cents:
   ```javascript
   // Correct: $50.00 = 5000 cents
   { amount: 5000, currency: 'usd', bookingId: 'BOOK123' }
   
   // Wrong
   { amount: 50, currency: 'usd', bookingId: 'BOOK123' }
   ```

4. Check Stripe logs:
   - Dashboard → Events
   - Look for error messages

---

### Issue 6: 404 Endpoints Not Found

**Error**: `Endpoint not found`

**Solution**:

Verify correct endpoint URLs:

```bash
# ✓ Correct
http://localhost:3001/api/flights
http://localhost:3001/api/hotels
http://localhost:3001/api/create-payment

# ✗ Wrong (these won't work)
http://localhost:3001/flights          # missing /api
http://localhost:3001/API/flights      # wrong case
http://localhost:3001/api/flight       # singular, should be plural
```

---

### Issue 7: Slow API Responses

**Symptoms**:
- Requests take 10+ seconds
- Intermittent timeouts

**Solution**:

1. Check internet connection:
   ```bash
   ping amadeus.com
   ```

2. Verify Amadeus/Stripe services are up:
   - [Amadeus Status](https://status.amadeus.com)
   - [Stripe Status](https://status.stripe.com)

3. Check server logs for bottlenecks:
   ```bash
   npm start  # Watch console output
   ```

4. Consider caching results (advanced)

---

### Issue 8: Missing Dependencies

**Error**: `Cannot find module 'express'`

**Solution**:

1. Reinstall all dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Verify dependencies installed:
   ```bash
   npm list
   ```

3. Expected packages:
   - express
   - cors
   - dotenv
   - amadeus
   - stripe
   - axios

---

### Issue 9: Environment Variables Not Loading

**Error**: Endpoints work locally but fail on Render

**Solution**:

1. Check `.env` file exists (not committed):
   ```bash
   ls -la .env
   ```

2. For **local testing**: Create `.env` file
   ```bash
   echo "PORT=3001" > .env
   echo "AMADEUS_API_KEY=your_key" >> .env
   echo "AMADEUS_API_SECRET=your_secret" >> .env
   echo "STRIPE_SECRET_KEY=your_stripe_key" >> .env
   ```

3. For **Render.com**: Set in dashboard:
   - Service → Settings → Environment
   - Add each variable separately
   - Restart service after adding variables

4. Never commit `.env` file!

---

### Issue 10: Base44 Actions Show Error Messages

**Error**: Red error boxes in Base44 UI

**Debugging**:

1. Open browser console (F12)
2. Look for error messages
3. Common causes:
   - Backend URL is wrong
   - Backend not running
   - CORS blocking request
   - Invalid parameters

4. Test endpoint directly:
   ```bash
   curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1"
   ```

5. Check response format matches expected structure

---

## Testing Checklist

Before going live, verify:

- [ ] Server starts without errors: `npm start`
- [ ] Health check works: `curl http://localhost:3001/`
- [ ] Flights endpoint responds: `curl http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1`
- [ ] Hotels endpoint responds: `curl http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1`
- [ ] Payment endpoint works (requires Stripe key)
- [ ] Base44 can reach the server (test CORS)
- [ ] Error handling works (try invalid params)
- [ ] Logs are readable in console

---

## Getting Help

If you're still stuck:

1. **Check server logs**:
   ```bash
   npm start  # Watch for error messages
   ```

2. **Check browser console** (F12):
   - Network tab shows request details
   - Console shows JS errors

3. **Verify configuration**:
   ```bash
   cat .env
   cat server.js
   ```

4. **Try mock data**:
   - Delete Amadeus credentials from `.env`
   - Server will return mock flight/hotel data
   - Good for testing without API keys

5. **Check service status**:
   - Amadeus: https://status.amadeus.com
   - Stripe: https://status.stripe.com

---

## Quick Reference

### Restart server
```bash
npm start
```

### Install fresh dependencies
```bash
npm install
```

### Test specific endpoint
```bash
curl http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1
```

### Check if port is in use
```bash
netstat -ano | findstr :3001
```

### View server logs (if running in background)
```bash
tail -f server.log
```
