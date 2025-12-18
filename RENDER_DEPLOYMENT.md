# Deployment Guide - Render.com

This guide covers deploying the MyEagle backend to Render.com.

## Prerequisites

- Render.com account (free tier available)
- GitHub account with repository containing the code
- API keys for:
  - Amadeus (optional, for production)
  - Stripe (required for payments)

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/myeagle-backend.git
git push -u origin main
```

### 2. Create Render.com Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository `myeagle-backend`
5. Configure the service:
   - **Name**: `myeagle-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (sufficient for testing)

### 3. Add Environment Variables

In the Render dashboard:

1. Go to your service → **Environment**
2. Add the following environment variables:

```
PORT=3001
NODE_ENV=production
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

**Note**: If you don't have Amadeus credentials yet, you can deploy without them. The server will use mock data.

### 4. Deploy

Click **Deploy**. Your service will be available at:
```
https://myeagle-api.onrender.com
```

## Getting API Keys

### Amadeus API
1. Visit [developers.amadeus.com](https://developers.amadeus.com)
2. Sign up for a free account
3. Create an application
4. Copy your **API Key** and **API Secret**
5. Keep these credentials private

### Stripe API
1. Visit [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Go to **Developers** → **API Keys**
4. Copy your **Secret Key** (starts with `sk_test_` for testing, `sk_live_` for production)
5. Never commit this key to version control

## Testing Your Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://myeagle-api.onrender.com/

# Search flights (uses mock data if Amadeus credentials missing)
curl "https://myeagle-api.onrender.com/api/flights?origin=TLV&destination=NYC&date=2025-12-20&passengers=1"

# Search hotels
curl "https://myeagle-api.onrender.com/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1"

# Create payment (requires valid Stripe key)
curl -X POST https://myeagle-api.onrender.com/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "currency": "usd", "bookingId": "BOOK123"}'
```

## Update Base44 Domain Configuration

Once you have your Render URL, update your Base44 custom actions to use:

```
https://myeagle-api.onrender.com/api/flights
https://myeagle-api.onrender.com/api/hotels
https://myeagle-api.onrender.com/api/create-payment
```

Change from:
```javascript
fetch('http://localhost:3001/api/flights?...')
```

To:
```javascript
fetch('https://myeagle-api.onrender.com/api/flights?...')
```

## Scaling

If you need better performance:

1. Upgrade to **Starter** plan ($7/month)
2. Enable **Auto-scaling** for production traffic
3. Add caching headers to reduce API calls

## Troubleshooting

### Service won't start
- Check **Logs** in Render dashboard
- Ensure all required dependencies are in `package.json`
- Verify environment variables are set

### API returns 500 errors
- Check service logs for error details
- Verify Amadeus/Stripe credentials if configured
- Check CORS settings if calling from different domain

### Payment endpoint fails
- Verify `STRIPE_SECRET_KEY` is set correctly
- Use test key (starts with `sk_test_`) for development
- Check Stripe dashboard for failed requests

## Cost Considerations

- **Free plan**: $0/month, sleeps after 15 minutes of inactivity
- **Starter plan**: $7/month, always running
- **API calls**: Amadeus and Stripe have their own pricing (check their docs)

## Next Steps

1. Configure Base44 custom actions with your Render URL
2. Set up Stripe webhook for production (optional, for order tracking)
3. Monitor API usage and adjust plan as needed
4. Add database if you need persistent storage (Render offers PostgreSQL)
