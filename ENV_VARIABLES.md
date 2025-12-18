# Environment Variables Configuration

Complete reference for all environment variables used by the MyEagle backend.

---

## Quick Setup

Create a `.env` file in the project root with these minimal settings:

```env
PORT=3001
NODE_ENV=development
```

The server will run with mock data (no real API calls needed).

---

## Complete Environment Variables Reference

### Server Configuration

#### PORT
- **Type**: Number
- **Default**: `3001`
- **Description**: Port on which the server listens
- **Examples**: `3001`, `8080`, `5000`
- **Usage**: 
  ```env
  PORT=3001
  ```
- **Note**: Server will listen on all interfaces (0.0.0.0)

#### NODE_ENV
- **Type**: String
- **Default**: `development`
- **Valid Values**: `development`, `production`, `staging`, `test`
- **Description**: Environment mode affecting logging and error details
- **Usage**:
  ```env
  NODE_ENV=development
  ```
- **Effects**:
  - `development`: Full error messages and stack traces in responses
  - `production`: Minimal error information for security

#### LOG_LEVEL
- **Type**: String
- **Default**: `info`
- **Valid Values**: `debug`, `info`, `warn`, `error`
- **Description**: Controls verbosity of console logging
- **Usage**:
  ```env
  LOG_LEVEL=debug
  ```
- **Examples**:
  - `debug`: All requests logged with full parameters
  - `info`: Request methods and paths only
  - `warn`: Only warnings and errors
  - `error`: Only errors

---

### Amadeus API Configuration

Used for real flight and hotel data. Optional - mock data works without these.

#### AMADEUS_CLIENT_ID
- **Type**: String (alphanumeric)
- **Default**: None (mock mode)
- **Description**: Amadeus API client identifier
- **Source**: [Amadeus Developer Portal](https://developers.amadeus.com)
- **Usage**:
  ```env
  AMADEUS_CLIENT_ID=your_client_id_here
  ```
- **Setup Steps**:
  1. Visit https://developers.amadeus.com
  2. Create a free account
  3. Create an application
  4. Copy the API key (Client ID)
  5. Paste into this environment variable

#### AMADEUS_CLIENT_SECRET
- **Type**: String (alphanumeric)
- **Default**: None (mock mode)
- **Description**: Amadeus API client secret (password)
- **Source**: [Amadeus Developer Portal](https://developers.amadeus.com)
- **Usage**:
  ```env
  AMADEUS_CLIENT_SECRET=your_client_secret_here
  ```
- **Security Notes**:
  - Never commit to version control
  - Never share publicly
  - Rotate if accidentally exposed
  - Use separate credentials for development/production

---

### Stripe Payment Configuration

Used for payment processing. Optional - payment endpoint returns error without this.

#### STRIPE_SECRET_KEY
- **Type**: String (starts with `sk_`)
- **Default**: None (payment disabled)
- **Description**: Stripe API secret key for payment processing
- **Source**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Usage**:
  ```env
  STRIPE_SECRET_KEY=sk_test_xxxxx
  ```
- **Setup Steps**:
  1. Create [Stripe account](https://stripe.com)
  2. Go to API Keys page
  3. Copy Secret Key (starts with `sk_`)
  4. Paste into this environment variable

- **Key Formats**:
  - **Test Mode**: `sk_test_...` - For development/testing
  - **Live Mode**: `sk_live_...` - For production (requires verification)

- **Restrict Key Permissions** (optional):
  1. In Stripe Dashboard → API Keys → Restricted Keys
  2. Grant only `payment_intents` scope
  3. Use restricted key for additional security

---

## Full Environment File Examples

### Development (Mock Data)

```env
# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# Amadeus (optional - will use mock data)
# AMADEUS_CLIENT_ID=
# AMADEUS_CLIENT_SECRET=

# Stripe (optional - payment endpoint disabled)
# STRIPE_SECRET_KEY=
```

### Development (With Real APIs)

```env
# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# Amadeus API (from developers.amadeus.com)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

# Stripe (from dashboard.stripe.com - test mode)
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### Production (Render.com)

```env
# Server
PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# Amadeus API (from developers.amadeus.com)
AMADEUS_CLIENT_ID=your_production_amadeus_id
AMADEUS_CLIENT_SECRET=your_production_amadeus_secret

# Stripe (from dashboard.stripe.com - live mode with verification)
STRIPE_SECRET_KEY=sk_live_xxxxx
```

### Production (Azure App Service)

```env
# Server
PORT=8080
NODE_ENV=production
LOG_LEVEL=warn

# Amadeus API
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

## Setting Environment Variables

### Windows - Command Prompt

#### Method 1: .env File (Recommended)

1. Create file `C:\Users\HELLO\Desktop\myeagle-backend\.env`
2. Add variables:
   ```
   PORT=3001
   NODE_ENV=development
   AMADEUS_CLIENT_ID=your_id
   AMADEUS_CLIENT_SECRET=your_secret
   STRIPE_SECRET_KEY=sk_test_xxx
   ```
3. Save and restart server

#### Method 2: Command Prompt Session

```cmd
REM Set for current command prompt session only
set PORT=3001
set NODE_ENV=development
npm start
```

#### Method 3: System Environment Variables (Global)

```cmd
REM Permanently set system variables
setx PORT 3001
setx NODE_ENV development

REM For Stripe/Amadeus (long values, use quotes)
setx STRIPE_SECRET_KEY "sk_test_xxxxx"
```

### Windows - PowerShell

#### Method 1: .env File (Recommended)

Same as Command Prompt (create `.env` file in project root)

#### Method 2: PowerShell Session

```powershell
# Set for current PowerShell session
$env:PORT = 3001
$env:NODE_ENV = "development"
npm start
```

#### Method 3: System Environment Variables

```powershell
# Permanently set system variables
[Environment]::SetEnvironmentVariable("PORT", "3001", "User")
[Environment]::SetEnvironmentVariable("NODE_ENV", "development", "User")

# For long values
[Environment]::SetEnvironmentVariable("STRIPE_SECRET_KEY", "sk_test_xxxxx", "User")
```

### Windows - Via GUI

1. **Open System Properties**:
   - Press `Win+R`
   - Type `sysdm.cpl`
   - Click `Advanced` tab
   - Click `Environment Variables`

2. **Add User Variables**:
   - Click `New` under "User variables"
   - Variable name: `PORT`
   - Variable value: `3001`
   - Click `OK`

3. **Repeat for each variable**:
   - AMADEUS_CLIENT_ID
   - AMADEUS_CLIENT_SECRET
   - STRIPE_SECRET_KEY
   - NODE_ENV
   - LOG_LEVEL

4. **Restart Command Prompt** (or PowerShell) for changes to take effect

---

## Verifying Environment Variables

### Command Prompt

```cmd
REM View specific variable
echo %PORT%

REM View all variables
set
```

### PowerShell

```powershell
# View specific variable
$env:PORT

# View all variables
Get-ChildItem env:

# View all with PORT in name
Get-ChildItem env: | Where-Object {$_.Name -like "*PORT*"}
```

### Node.js

```javascript
// In your code
console.log(process.env.PORT);
console.log(process.env.AMADEUS_CLIENT_ID);
console.log(process.env.STRIPE_SECRET_KEY);

// View all environment variables
console.log(process.env);
```

### From Server Logs

Start the server and check console output:

```
[✓] Server running: http://localhost:3001
[✓] Amadeus API configured successfully
[✓] Stripe payment processor configured
```

If you see warnings about missing keys, those APIs are not configured.

---

## Getting API Credentials

### Amadeus API

**Free tier available**:

1. Go to https://developers.amadeus.com
2. Click **Register**
3. Fill out the form (name, email, password)
4. Verify email
5. Accept Terms and Conditions
6. Create your first application
7. Go to **My Apps** → Select app
8. Copy **Client ID** and **Client Secret**
9. Add to your `.env` file

**Includes**:
- Flights search (mock mode during testing)
- Hotel search
- City search
- 10,000 requests/month (free tier)

**Endpoint rate limits**:
- Flights: 100 requests/hour
- Hotels: 100 requests/hour

### Stripe

**Test mode available (no payment required)**:

1. Go to https://stripe.com/docs/keys
2. Or create account at https://stripe.com
3. Click **Developers**
4. Click **API Keys**
5. Copy **Secret Key** (starts with `sk_test_`)
6. Add to your `.env` file as `STRIPE_SECRET_KEY`

**Test Mode**:
- Use cards like `4242 4242 4242 4242`
- No real charges
- Unlimited test transactions

**Live Mode** (for production):
- Requires business verification
- Real payment processing
- Live mode keys start with `sk_live_`

---

## Security Best Practices

### DO's ✓

- ✅ Store secrets in `.env` file (add to `.gitignore`)
- ✅ Use different credentials for dev/prod
- ✅ Rotate keys if accidentally exposed
- ✅ Use environment variables on production servers
- ✅ Restrict API key permissions in dashboards
- ✅ Monitor API usage for suspicious activity
- ✅ Use strong, random passwords if rotating manually

### DON'Ts ✗

- ❌ Never commit `.env` to git/GitHub
- ❌ Never share API keys via email or chat
- ❌ Never use production keys in development
- ❌ Never log sensitive values (they're redacted in this server)
- ❌ Never hardcode credentials in source code
- ❌ Never share credentials with team members - use centralized secret management
- ❌ Never use test API keys in production

---

## Troubleshooting

### Issue: "Amadeus not configured"

```
[⚠] Amadeus credentials not found
```

**Solution**:
1. Check `.env` file exists in project root
2. Verify variable names: `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`
3. Verify values are not empty
4. Restart server: `npm start`
5. Server will use mock data - this is fine for testing

### Issue: "Stripe not configured"

```
[⚠] Stripe API key not found
```

**Solution**:
1. Check `.env` file has `STRIPE_SECRET_KEY`
2. Verify key starts with `sk_test_` or `sk_live_`
3. Restart server
4. Payment endpoint will return error - this is expected

### Issue: Variables not loading

**Symptoms**: `process.env.VARIABLE_NAME` is `undefined`

**Solutions**:
1. **Check .env file**:
   - File exists at project root
   - No spaces around `=`: `PORT=3001` not `PORT = 3001`
   - Each variable on new line

2. **Windows Command Prompt**:
   - System variables require Command Prompt restart
   - Try closing and reopening Command Prompt

3. **Windows PowerShell**:
   - System variables require PowerShell restart
   - Or restart entire computer for system env vars

4. **IDE (VS Code)**:
   - Restart the IDE after changing `.env`
   - Or reload the terminal

5. **Production Server**:
   - Verify environment variables are set on the server
   - Not just in local `.env` file
   - Different servers have different methods

### Issue: "Invalid Amadeus credentials"

```
[✗] Amadeus initialization failed
```

**Solution**:
1. Verify credentials are from https://developers.amadeus.com (not Stripe or other API)
2. Check you copied the correct values
3. Ensure no extra spaces or quotes
4. Try creating a new application in Amadeus dashboard
5. Verify your account email is verified

### Issue: "Invalid Stripe key"

```
[✗] Stripe initialization failed
```

**Solution**:
1. Verify key starts with `sk_test_` (test) or `sk_live_` (production)
2. Check you're using Secret Key, not Publishable Key
3. Verify Stripe account is active (not suspended)
4. Check key hasn't been revoked in dashboard
5. Try regenerating a new key

---

## .gitignore Configuration

Ensure `.env` file is never committed:

```
# .gitignore
.env
.env.local
.env.*.local
node_modules/
*.log
```

Check it's ignored:

```cmd
git status
```

Should NOT show `.env` in the list.

---

## Docker Deployment

When deploying with Docker, set environment variables in:

### Method 1: Docker run command

```bash
docker run -e PORT=3001 -e NODE_ENV=production \
  -e AMADEUS_CLIENT_ID=your_id \
  -e AMADEUS_CLIENT_SECRET=your_secret \
  -e STRIPE_SECRET_KEY=sk_live_xxx \
  myeagle-api
```

### Method 2: .env file mounted as secret

```bash
docker run --env-file .env myeagle-api
```

### Method 3: Docker Compose

```yaml
services:
  api:
    image: myeagle-api
    environment:
      - PORT=3001
      - NODE_ENV=production
      - AMADEUS_CLIENT_ID=${AMADEUS_CLIENT_ID}
      - AMADEUS_CLIENT_SECRET=${AMADEUS_CLIENT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
```

---

## Render.com Deployment

1. **In Render Dashboard**:
   - Go to your service
   - Click **Environment**
   - Add variables one by one:
     - `PORT` = `3001`
     - `NODE_ENV` = `production`
     - `AMADEUS_CLIENT_ID` = (your value)
     - `AMADEUS_CLIENT_SECRET` = (your value)
     - `STRIPE_SECRET_KEY` = (your key)

2. **Save and redeploy**:
   - Click **Save**
   - Service will redeploy with new variables

3. **Verify**:
   - Check logs for configuration messages
   - Call health check: `GET /`

---

## Testing Variables

Create a test endpoint to verify all variables are loaded:

```javascript
app.get('/api/config', (req, res) => {
  res.json({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    AMADEUS_configured: !!process.env.AMADEUS_CLIENT_ID,
    STRIPE_configured: !!process.env.STRIPE_SECRET_KEY
  });
});
```

Then test:

```bash
curl http://localhost:3001/api/config
```

Response:
```json
{
  "PORT": "3001",
  "NODE_ENV": "development",
  "AMADEUS_configured": true,
  "STRIPE_configured": true
}
```

---

**Last Updated**: December 16, 2025
**Version**: 1.0.0
**Platform Support**: Windows, macOS, Linux, Render.com, Docker, Azure
