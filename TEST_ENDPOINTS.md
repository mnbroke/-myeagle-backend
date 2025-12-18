# Testing API Endpoints

Complete guide for testing all MyEagle backend API endpoints with various tools and scenarios.

---

## Prerequisites

1. **Server running**: `npm start` or `start-server.bat`
2. **Server should output**: `Server running at http://localhost:3001`
3. **Use curl** (Windows 10+ built-in) or **PowerShell**

---

## Quick Test All Endpoints

### Using Batch File (Easiest)

Simply run:
```cmd
test-endpoints.bat
```

### Using Command Prompt (curl)

```cmd
REM 1. Health Check
curl http://localhost:3001

REM 2. Search Flights
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2"

REM 3. Search Hotels
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2"

REM 4. Create Payment (requires Stripe key)
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":25000,\"currency\":\"usd\",\"bookingId\":\"BK-TEST-001\"}"
```

### Using PowerShell

```powershell
# 1. Health Check
Invoke-WebRequest -Uri "http://localhost:3001" -Method Get | Select-Object -ExpandProperty Content

# 2. Search Flights
Invoke-WebRequest -Uri "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2" -Method Get | Select-Object -ExpandProperty Content

# 3. Search Hotels
Invoke-WebRequest -Uri "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2" -Method Get | Select-Object -ExpandProperty Content

# 4. Create Payment
$body = @{
    amount = 25000
    currency = "usd"
    bookingId = "BK-TEST-001"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/create-payment" -Method Post -ContentType "application/json" -Body $body | Select-Object -ExpandProperty Content
```

---

## Endpoint 1: Health Check

Check if the server is running and responding.

### Command

**curl:**
```cmd
curl http://localhost:3001
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001" -Method Get
```

### Expected Response

```json
{
  "status": "ok",
  "service": "MyEagle Travel Booking API",
  "uptime": "2 minutes",
  "version": "1.0.0"
}
```

### Status Code
- ✅ `200 OK` - Server is running

---

## Endpoint 2: Search Flights

Search for available flights between two airports.

### Basic Usage

**curl:**
```cmd
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2"
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `origin` | string | Yes | 3-letter airport code | `TLV`, `NYC`, `LAX` |
| `destination` | string | Yes | 3-letter airport code | `NYC`, `LON`, `PAR` |
| `date` | string | Yes | Departure date (YYYY-MM-DD) | `2025-12-25` |
| `passengers` | number | Yes | Number of passengers (1-9) | `1`, `2`, `4` |
| `sortBy` | string | No | Sort by: price, duration, airline, stops | `price` (default) |
| `maxPrice` | number | No | Maximum price per ticket | `1500` |
| `maxStops` | number | No | Maximum number of stops | `1`, `2` |

### Example Requests

```cmd
REM Basic search
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=1"

REM Search with sorting - by duration
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2&sortBy=duration"

REM Search with sorting - by airline
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=1&sortBy=airline"

REM Search with filtering - max price
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2&maxPrice=1200"

REM Search with filtering - direct flights only
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=1&maxStops=0"

REM Combined: sort by price, max 2 stops, 3 passengers
curl "http://localhost:3001/api/flights?origin=NYC&destination=LAX&date=2025-12-30&passengers=3&sortBy=price&maxStops=2"
```

### Expected Response

```json
{
  "success": true,
  "flights": [
    {
      "id": "FL-001",
      "airline": "United Airlines",
      "departure": "14:30",
      "arrival": "22:45",
      "duration": "8h 15m",
      "price": 850,
      "stops": 0,
      "origin": "TLV",
      "destination": "NYC"
    },
    {
      "id": "FL-002",
      "airline": "El Al",
      "departure": "09:00",
      "arrival": "18:30",
      "duration": "9h 30m",
      "price": 920,
      "stops": 1,
      "origin": "TLV",
      "destination": "NYC"
    }
  ],
  "source": "mock",
  "count": 2,
  "summary": {
    "minPrice": 850,
    "maxPrice": 920,
    "avgPrice": 885
  },
  "duration": "15ms",
  "timestamp": "2025-12-16T10:30:00.000Z"
}
```

### Status Codes
- ✅ `200 OK` - Flights found
- ⚠️ `400 Bad Request` - Missing or invalid parameters
- ❌ `500 Internal Server Error` - Server error

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Missing parameter | Missing origin/destination/date/passengers | Include all required parameters |
| Invalid airport code | Code not 3 letters | Use 3-letter codes: TLV, NYC, LON |
| Invalid date | Wrong format or past date | Use YYYY-MM-DD format, future dates |
| Invalid passengers | Not 1-9 | Use passengers between 1 and 9 |

---

## Endpoint 3: Search Hotels

Search for available hotels in a city for specific dates.

### Basic Usage

**curl:**
```cmd
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2"
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `cityCode` | string | Yes | 3-letter city code | `NYC`, `LON`, `PAR` |
| `checkIn` | string | Yes | Check-in date (YYYY-MM-DD) | `2025-12-20` |
| `checkOut` | string | Yes | Check-out date (YYYY-MM-DD) | `2025-12-25` |
| `guests` | number | Yes | Number of guests (1-9) | `1`, `2`, `4` |
| `sortBy` | string | No | Sort by: price, rating, name | `price` (default) |
| `maxPrice` | number | No | Maximum price per night | `300` |
| `minRating` | number | No | Minimum rating (1-5) | `4`, `4.5` |

### Example Requests

```cmd
REM Basic search
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1"

REM Search sorted by rating
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2&sortBy=rating"

REM Search sorted by name
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2&sortBy=name"

REM Search with price filter
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2&maxPrice=250"

REM Search with rating filter
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2&minRating=4"

REM Combined: sorted by price, max $200/night, min 4-star rating
curl "http://localhost:3001/api/hotels?cityCode=LON&checkIn=2025-12-22&checkOut=2025-12-27&guests=3&sortBy=price&maxPrice=200&minRating=4"
```

### Expected Response

```json
{
  "success": true,
  "hotels": [
    {
      "id": "HT-001",
      "name": "Grand Central Hotel",
      "cityCode": "NYC",
      "checkIn": "2025-12-20",
      "checkOut": "2025-12-25",
      "price": 1200,
      "pricePerNight": 240,
      "totalPrice": 1200,
      "rating": 4.5,
      "address": "123 Main St, New York, NY 10001",
      "amenities": ["WiFi", "Gym", "Restaurant"]
    },
    {
      "id": "HT-002",
      "name": "Park View Inn",
      "cityCode": "NYC",
      "checkIn": "2025-12-20",
      "checkOut": "2025-12-25",
      "price": 950,
      "pricePerNight": 190,
      "totalPrice": 950,
      "rating": 4.0,
      "address": "456 Park Ave, New York, NY 10022",
      "amenities": ["WiFi", "Parking"]
    }
  ],
  "source": "mock",
  "count": 2,
  "nights": 5,
  "summary": {
    "minPrice": 950,
    "maxPrice": 1200,
    "avgPrice": 1075,
    "minRating": 4.0,
    "maxRating": 4.5,
    "avgRating": "4.3"
  },
  "duration": "18ms",
  "timestamp": "2025-12-16T10:30:00.000Z"
}
```

### Status Codes
- ✅ `200 OK` - Hotels found
- ⚠️ `400 Bad Request` - Missing or invalid parameters
- ❌ `500 Internal Server Error` - Server error

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid date range | Check-out before check-in | Ensure checkOut > checkIn |
| Past dates | Check-in in the past | Use future dates |
| Invalid city code | Code not 3 letters | Use 3-letter codes: NYC, LON, PAR |
| Stay too long | More than 90 days | Maximum 90-day stay |

---

## Endpoint 4: Create Payment

Create a Stripe payment intent for booking confirmation.

### Basic Usage

**curl:**
```cmd
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":25000,\"currency\":\"usd\",\"bookingId\":\"BK-20250216-001\"}"
```

**PowerShell:**
```powershell
$body = @{
    amount = 25000
    currency = "usd"
    bookingId = "BK-20250216-001"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/create-payment" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### Request Body Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `amount` | number | Yes | Amount in cents | `25000` (= $250.00) |
| `currency` | string | Yes | Currency code (ISO 4217) | `usd`, `eur`, `gbp` |
| `bookingId` | string | Yes | Unique booking identifier | `BK-20250216-001` |

### Example Requests

```cmd
REM Create payment for $100.00
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":10000,\"currency\":\"usd\",\"bookingId\":\"BK-TEST-001\"}"

REM Create payment for €500.00
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":50000,\"currency\":\"eur\",\"bookingId\":\"BK-20250216-EURO\"}"

REM Create payment for £1000.00
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":100000,\"currency\":\"gbp\",\"bookingId\":\"BK-20250216-GBP\"}"

REM Create large payment ($5000)
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":500000,\"currency\":\"usd\",\"bookingId\":\"BK-LARGE-001\"}"
```

### Expected Response (With Stripe Key)

```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_1234567890abcdef",
  "paymentIntentId": "pi_1234567890",
  "amount": 25000,
  "currency": "usd",
  "bookingId": "BK-20250216-001",
  "status": "requires_payment_method",
  "timestamp": "2025-12-16T10:30:00.000Z"
}
```

### Response (Without Stripe Key - Mock Mode)

```json
{
  "success": false,
  "error": "Stripe API key not configured",
  "details": "Set STRIPE_SECRET_KEY in .env file to enable payment processing",
  "amount": 25000,
  "currency": "usd",
  "bookingId": "BK-20250216-001",
  "timestamp": "2025-12-16T10:30:00.000Z"
}
```

### Status Codes
- ✅ `200 OK` - Payment intent created
- ⚠️ `400 Bad Request` - Missing or invalid parameters
- ❌ `500 Internal Server Error` - Server error

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid amount | Amount < 1 cent or not a number | Use amount >= 100 (cents) |
| Missing currency | Currency parameter not provided | Add currency (usd, eur, gbp, jpy) |
| Missing bookingId | No booking identifier | Provide unique booking ID |
| Stripe key missing | Environment not configured | Add STRIPE_SECRET_KEY to .env |

---

## Testing Scenarios

### Scenario 1: Complete Booking Flow

```cmd
REM 1. Search for flights
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2"

REM 2. Search for hotels
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-25&checkOut=2025-12-27&guests=2"

REM 3. Create payment for both flights and hotel
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":295000,\"currency\":\"usd\",\"bookingId\":\"BK-FULL-TRIP-001\"}"
```

### Scenario 2: Multi-City Trip

```cmd
REM 1. TLV to NYC
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=1"

REM 2. NYC hotels
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-25&checkOut=2025-12-27&guests=1"

REM 3. NYC to LON
curl "http://localhost:3001/api/flights?origin=NYC&destination=LON&date=2025-12-27&passengers=1"

REM 4. LON hotels
curl "http://localhost:3001/api/hotels?cityCode=LON&checkIn=2025-12-27&checkOut=2025-12-29&guests=1"

REM 5. Pay for entire trip
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":180000,\"currency\":\"usd\",\"bookingId\":\"BK-MULTI-CITY-001\"}"
```

### Scenario 3: Group Travel

```cmd
REM 1. Search flights for 4 people
curl "http://localhost:3001/api/flights?origin=LAX&destination=LAS&date=2025-12-20&passengers=4&maxPrice=400"

REM 2. Search hotels for 4 guests (2 rooms needed)
curl "http://localhost:3001/api/hotels?cityCode=LAS&checkIn=2025-12-20&checkOut=2025-12-23&guests=4&sortBy=rating&minRating=4"

REM 3. Payment for group
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":240000,\"currency\":\"usd\",\"bookingId\":\"BK-GROUP-VEGAS-001\"}"
```

---

## Using Postman for Testing

If you prefer a GUI tool:

1. **Download Postman**: https://www.postman.com/downloads/
2. **Create a new Collection**: "MyEagle API Tests"
3. **Add requests for each endpoint:**

### Health Check Request
- **Method**: GET
- **URL**: `http://localhost:3001`

### Flights Search Request
- **Method**: GET
- **URL**: `http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2`

### Hotels Search Request
- **Method**: GET
- **URL**: `http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2`

### Create Payment Request
- **Method**: POST
- **URL**: `http://localhost:3001/api/create-payment`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "amount": 25000,
    "currency": "usd",
    "bookingId": "BK-POSTMAN-TEST"
  }
  ```

---

## Using Thunder Client (VS Code Extension)

1. **Install Extension**: Thunder Client in VS Code
2. **Create requests** for each endpoint
3. **Save requests** as collection
4. **Run tests** with one click

---

## Performance Testing

### Load Testing with Apache Bench

```cmd
REM Install Apache Bench (if not installed)
REM Then test the server with 100 requests
ab -n 100 -c 10 http://localhost:3001/

REM Test flights endpoint with 50 requests
ab -n 50 -c 5 "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2"
```

### Using PowerShell for Load Testing

```powershell
# Make 10 requests and measure time
1..10 | ForEach-Object {
    Measure-Command {
        Invoke-WebRequest -Uri "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2" -Method Get -UseBasicParsing
    }
}
```

---

## Automated Testing Script

Create `test-all.bat`:

```batch
@echo off
echo ===== MyEagle API Test Suite =====
echo.

echo 1. Health Check...
curl http://localhost:3001
echo.
echo.

echo 2. Flight Search...
curl "http://localhost:3001/api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=2"
echo.
echo.

echo 3. Hotel Search...
curl "http://localhost:3001/api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=2"
echo.
echo.

echo 4. Payment Creation...
curl -X POST http://localhost:3001/api/create-payment ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\":25000,\"currency\":\"usd\",\"bookingId\":\"BK-TEST-001\"}"
echo.
echo.

echo ===== Tests Complete =====
pause
```

---

## Troubleshooting Test Issues

### Issue: "Connection refused"
```
Solution: Make sure server is running (npm start)
```

### Issue: "Invalid JSON response"
```
Solution: Server may have crashed
Check: npm start output for errors
```

### Issue: "CORS error in browser console"
```
Solution: CORS is configured for Base44 domain
For local testing, check server.js CORS settings
```

### Issue: "Timeout on payment endpoint"
```
Solution: Stripe key might be missing or invalid
Check: .env file has valid STRIPE_SECRET_KEY
```

---

## Tips for Effective Testing

1. **Keep server running** in separate terminal/window
2. **Test parameters one at a time** to isolate issues
3. **Check JSON responses** are valid (use `| jq` with curl for pretty-printing)
4. **Save successful requests** for regression testing
5. **Use Postman/Thunder Client** for complex requests
6. **Test with real-world data** (valid airport/city codes, future dates)
7. **Monitor server logs** for detailed error messages

---

**Last Updated:** December 16, 2025
**Server Version:** 1.0.0
**Tested on:** Windows 10+, Windows Server 2019+
