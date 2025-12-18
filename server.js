/**
 * MyEagle Travel Booking Backend API
 * 
 * Production-ready Express.js server with:
 * - Flight search (Amadeus API with mock fallback)
 * - Hotel search (Amadeus API with mock fallback)
 * - Stripe payment processing
 * - Comprehensive error handling with user-friendly messages
 * - CORS support for Base44 and localhost
 * - Request logging and validation
 * - Async/await for all operations
 * - Consistent JSON response format
 * 
 * Environment Variables:
 *   PORT                    - Server port (default: 3001)
 *   NODE_ENV               - Environment (development/production)
 *   AMADEUS_CLIENT_ID      - Amadeus API client ID
 *   AMADEUS_CLIENT_SECRET  - Amadeus API client secret
 *   STRIPE_SECRET_KEY      - Stripe secret API key
 *   LOG_LEVEL              - Logging level (debug/info/warn/error)
 * 
 * Start:
 *   npm start              - Start the server
 *   npm test               - Run test suite
 * 
 * API Endpoints:
 *   GET  /                    - Health check
 *   GET  /api/flights         - Search flights
 *   GET  /api/hotels          - Search hotels
 *   POST /api/create-payment  - Create Stripe payment intent
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize optional APIs (graceful degradation with mock data)
let Amadeus = null;
let amadeus = null;
try {
  Amadeus = require('amadeus');
} catch (e) {
  console.warn('[⚠] Amadeus package not available');
}

let Stripe = null;
let stripe = null;
try {
  Stripe = require('stripe');
} catch (e) {
  console.warn('[⚠] Stripe package not available');
}

const app = express();
app.use(express.json());

/**
 * CORS Configuration
 * Allows Base44 domain and localhost for development
 * With credentials support for authenticated requests
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://base44.com',
      'https://app.base44.com',
      'https://editor.base44.com',
      'http://localhost:3000',
      'http://localhost:8000',
      'http://localhost:5173',  // Vite dev server
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8000'
    ];

    // Allow requests without origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[⚠] CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400  // 24 hours
};
app.use(cors(corsOptions));

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, and parameters
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logLevel = process.env.LOG_LEVEL || 'info';
  
  if (logLevel === 'debug' || logLevel === 'info') {
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    if (Object.keys(req.query).length > 0) {
      console.log(`  └─ Query: ${JSON.stringify(req.query)}`);
    }
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyCopy = { ...req.body };
      if (bodyCopy.clientSecret) bodyCopy.clientSecret = '***hidden***';
      console.log(`  └─ Body: ${JSON.stringify(bodyCopy)}`);
    }
  }
  
  next();
});

/**
 * Initialize Amadeus API client
 * Gracefully degrades to mock data if credentials missing
 */
if (Amadeus && process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
  try {
    amadeus = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET
    });
    console.log('[✓] Amadeus API configured successfully');
  } catch (err) {
    console.error('[✗] Amadeus initialization failed:', err.message);
    console.warn('[⚠] Will use mock data for flights and hotels');
  }
} else {
  console.warn('[⚠] Amadeus credentials not found. Environment variables required:');
  console.warn('     - AMADEUS_CLIENT_ID');
  console.warn('     - AMADEUS_CLIENT_SECRET');
  console.warn('   → Using mock data for flights and hotels');
}

/**
 * Initialize Stripe payment processor
 * Requires valid secret key for payment processing
 */
if (Stripe && process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('[✓] Stripe payment processor configured');
  } catch (err) {
    console.error('[✗] Stripe initialization failed:', err.message);
  }
} else {
  if (!Stripe) {
    console.warn('[⚠] Stripe package not installed');
  } else {
    console.warn('[⚠] Stripe API key not found. Environment variable required:');
    console.warn('     - STRIPE_SECRET_KEY');
  }
  console.warn('   → Payment creation will return error with instructions');
}

/**
 * Mock data generators for graceful API degradation
 * Provides realistic test data when real APIs unavailable
 */

/**
 * Generate mock flight data
 */
function generateMockFlights(origin, destination, date, passengers) {
  const airlines = ['United Airlines', 'El Al', 'British Airways', 'Lufthansa', 'Air France'];
  const basePrice = 600;
  
  return [
    {
      id: 'FL-MOCK-001',
      origin,
      destination,
      date,
      departure: '14:30',
      arrival: '22:45',
      duration: '8h 15m',
      price: basePrice,
      airline: airlines[0],
      stops: 0,
      pricePerPassenger: basePrice,
      totalPrice: basePrice * parseInt(passengers)
    },
    {
      id: 'FL-MOCK-002',
      origin,
      destination,
      date,
      departure: '09:00',
      arrival: '18:30',
      duration: '9h 30m',
      price: basePrice + 120,
      airline: airlines[1],
      stops: 1,
      pricePerPassenger: basePrice + 120,
      totalPrice: (basePrice + 120) * parseInt(passengers)
    },
    {
      id: 'FL-MOCK-003',
      origin,
      destination,
      date,
      departure: '11:15',
      arrival: '20:00',
      duration: '8h 45m',
      price: basePrice + 80,
      airline: airlines[2],
      stops: 0,
      pricePerPassenger: basePrice + 80,
      totalPrice: (basePrice + 80) * parseInt(passengers)
    }
  ];
}

/**
 * Generate mock hotel data
 */
function generateMockHotels(cityCode, checkIn, checkOut, guests) {
  const hotels = {
    NYC: [
      { name: 'Grand Central Hotel', rating: 4.8, basePrice: 280 },
      { name: 'Park View Inn', rating: 4.5, basePrice: 220 },
      { name: 'Downtown Suites', rating: 4.2, basePrice: 180 }
    ],
    LON: [
      { name: 'Royal London Hotel', rating: 4.7, basePrice: 250 },
      { name: 'Westminster Inn', rating: 4.4, basePrice: 190 },
      { name: 'City Center Hostel', rating: 4.0, basePrice: 120 }
    ],
    PAR: [
      { name: 'Hotel de Luxe', rating: 4.9, basePrice: 320 },
      { name: 'Marais Boutique', rating: 4.6, basePrice: 240 },
      { name: 'Left Bank Budget', rating: 4.1, basePrice: 140 }
    ]
  };

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  const cityHotels = hotels[cityCode?.toUpperCase()] || hotels['NYC'];
  
  return cityHotels.map((h, idx) => ({
    id: `HT-MOCK-${String(idx + 1).padStart(3, '0')}`,
    name: h.name,
    cityCode,
    checkIn,
    checkOut,
    nights,
    pricePerNight: h.basePrice,
    price: h.basePrice * nights,
    totalPrice: h.basePrice * nights,
    rating: h.rating,
    address: `${100 + idx} Main St, ${cityCode}, ${cityCode}`,
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Pool']
  }));
}

/**
 * REST API Endpoints
 */

/**
 * GET /
 * Health check endpoint - verify server is running
 * 
 * Response: { status, timestamp, version, services }
 */
app.get('/', async (req, res) => {
  try {
    const response = {
      success: true,
      status: 'ok',
      service: 'MyEagle Travel Booking API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        flights: amadeus ? 'live' : 'mock',
        hotels: amadeus ? 'live' : 'mock',
        payments: stripe ? 'enabled' : 'disabled'
      },
      endpoints: {
        flights: 'GET /api/flights?origin=TLV&destination=NYC&date=2025-12-25&passengers=1',
        hotels: 'GET /api/hotels?cityCode=NYC&checkIn=2025-12-20&checkOut=2025-12-25&guests=1',
        payment: 'POST /api/create-payment'
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('[✗] Health check error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: err.message
    });
  }
});

/**
 * GET /api/flights
 * Search available flights
 * 
 * Query Parameters:
 *   origin       (required) - 3-letter airport code (e.g., TLV, NYC, LAX)
 *   destination  (required) - 3-letter airport code
 *   date         (required) - Departure date (YYYY-MM-DD)
 *   passengers   (optional) - Number of passengers, 1-9 (default: 1)
 *   sortBy       (optional) - price, duration, airline, stops (default: price)
 *   maxPrice     (optional) - Maximum price per ticket
 *   maxStops     (optional) - Maximum number of stops
 * 
 * Response: { success, flights[], source, count, summary, timestamp, error? }
 */
app.get('/api/flights', async (req, res) => {
  const startTime = Date.now();
  const { origin, destination, date, passengers = 1, sortBy, maxPrice, maxStops } = req.query;

  // Input validation
  const validation = validateFlightSearch({ origin, destination, date, passengers });
  if (!validation.valid) {
    console.warn(`[⚠] Flight search validation failed: ${validation.error}`);
    return res.status(400).json({
      success: false,
      error: validation.error,
      details: validation.details,
      required: {
        origin: '3-letter airport code (e.g., TLV, NYC, LAX)',
        destination: '3-letter airport code',
        date: 'YYYY-MM-DD format',
        passengers: 'number 1-9'
      },
      received: { origin, destination, date, passengers }
    });
  }

  try {
    let flights = [];

    // Try real API first, fallback to mock
    if (amadeus) {
      try {
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: origin.toUpperCase(),
          destinationLocationCode: destination.toUpperCase(),
          departureDate: date,
          adults: parseInt(passengers)
        });

        flights = (response.data || []).slice(0, 10).map((offer, idx) => {
          const firstSegment = offer.itineraries?.[0]?.segments?.[0] || {};
          const lastSegment = offer.itineraries?.[0]?.segments?.slice(-1)[0] || {};
          const price = parseFloat(offer.price?.total) || 0;
          const airline = firstSegment?.carrierCode || 'Unknown';
          const duration = offer.itineraries?.[0]?.duration || 'Unknown';
          const stops = Math.max(0, (offer.itineraries?.[0]?.segments?.length || 1) - 1);

          return {
            id: offer.id || `FL-${String(idx + 1).padStart(3, '0')}`,
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            date,
            departure: firstSegment?.departure?.time || 'TBD',
            arrival: lastSegment?.arrival?.time || 'TBD',
            duration,
            price: Math.round(price),
            airline,
            stops,
            pricePerPassenger: Math.round(price),
            totalPrice: Math.round(price * parseInt(passengers))
          };
        });

        console.log(`[✓] Flights API: ${flights.length} flights found`);
      } catch (apiErr) {
        console.warn(`[⚠] Amadeus API error: ${apiErr.message}. Using mock data.`);
        flights = generateMockFlights(origin, destination, date, passengers);
      }
    } else {
      flights = generateMockFlights(origin, destination, date, passengers);
    }

    // Apply filters
    if (maxPrice) {
      flights = flights.filter(f => f.pricePerPassenger <= parseInt(maxPrice));
    }
    if (maxStops !== undefined) {
      flights = flights.filter(f => f.stops <= parseInt(maxStops));
    }

    // Apply sorting
    flights = sortFlights(flights, sortBy);

    // Calculate statistics
    const prices = flights.map(f => f.pricePerPassenger);
    const summary = {
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
      count: flights.length
    };

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      flights,
      source: amadeus ? 'amadeus' : 'mock',
      count: flights.length,
      summary,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[✗] Flight search error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search flights',
      details: err.message,
      suggestion: 'Please try again. If error persists, contact support.'
    });
  }
});

/**
 * GET /api/hotels
 * Search available hotels
 * 
 * Query Parameters:
 *   cityCode     (required) - 3-letter city code (e.g., NYC, LON, PAR)
 *   checkIn      (required) - Check-in date (YYYY-MM-DD)
 *   checkOut     (required) - Check-out date (YYYY-MM-DD)
 *   guests       (optional) - Number of guests, 1-9 (default: 1)
 *   sortBy       (optional) - price, rating, name (default: price)
 *   maxPrice     (optional) - Maximum price per night
 *   minRating    (optional) - Minimum rating (1-5)
 * 
 * Response: { success, hotels[], source, count, nights, summary, timestamp, error? }
 */
app.get('/api/hotels', async (req, res) => {
  const startTime = Date.now();
  const { cityCode, checkIn, checkOut, guests = 1, sortBy, maxPrice, minRating } = req.query;

  // Input validation
  const validation = validateHotelSearch({ cityCode, checkIn, checkOut, guests });
  if (!validation.valid) {
    console.warn(`[⚠] Hotel search validation failed: ${validation.error}`);
    return res.status(400).json({
      success: false,
      error: validation.error,
      details: validation.details,
      required: {
        cityCode: '3-letter city code (e.g., NYC, LON, PAR)',
        checkIn: 'YYYY-MM-DD format',
        checkOut: 'YYYY-MM-DD format (must be after checkIn)',
        guests: 'number 1-9'
      },
      received: { cityCode, checkIn, checkOut, guests }
    });
  }

  try {
    let hotels = [];
    const nights = Math.floor((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

    // Try real API first, fallback to mock
    if (amadeus) {
      try {
        const response = await amadeus.shopping.hotelOffers.get({
          cityCode: cityCode.toUpperCase(),
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: parseInt(guests)
        });

        hotels = (response.data || []).slice(0, 10).map((h, idx) => {
          const price = h.offers?.[0]?.price?.total || 0;
          const currency = h.offers?.[0]?.price?.currency || 'USD';

          return {
            id: h.hotel?.hotelId || `HT-${String(idx + 1).padStart(3, '0')}`,
            name: h.hotel?.name || h.hotel?.hotelName || 'Unknown Hotel',
            cityCode: cityCode.toUpperCase(),
            checkIn,
            checkOut,
            nights,
            pricePerNight: Math.round(price / nights),
            price: Math.round(price),
            totalPrice: Math.round(price),
            rating: h.hotel?.rating ? parseFloat(h.hotel.rating) : null,
            address: h.hotel?.address?.text || 'Address not available',
            currency
          };
        });

        console.log(`[✓] Hotels API: ${hotels.length} hotels found`);
      } catch (apiErr) {
        console.warn(`[⚠] Amadeus API error: ${apiErr.message}. Using mock data.`);
        hotels = generateMockHotels(cityCode, checkIn, checkOut, guests);
      }
    } else {
      hotels = generateMockHotels(cityCode, checkIn, checkOut, guests);
    }

    // Apply filters
    if (maxPrice) {
      hotels = hotels.filter(h => h.pricePerNight <= parseInt(maxPrice));
    }
    if (minRating) {
      hotels = hotels.filter(h => h.rating && h.rating >= parseFloat(minRating));
    }

    // Apply sorting
    hotels = sortHotels(hotels, sortBy);

    // Calculate statistics
    const prices = hotels.map(h => h.pricePerNight);
    const ratings = hotels.map(h => h.rating).filter(r => r !== null);
    const summary = {
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
      minRating: ratings.length ? Math.min(...ratings) : null,
      maxRating: ratings.length ? Math.max(...ratings) : null,
      avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null
    };

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      hotels,
      source: amadeus ? 'amadeus' : 'mock',
      count: hotels.length,
      nights,
      summary,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[✗] Hotel search error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search hotels',
      details: err.message,
      suggestion: 'Please try again. If error persists, contact support.'
    });
  }
});

/**
 * POST /api/create-payment
 * Create a Stripe payment intent for booking
 * 
 * Request Body:
 *   amount     (required) - Amount in cents (e.g., 25000 = $250.00)
 *   currency   (optional) - Currency code: usd, eur, gbp, jpy (default: usd)
 *   bookingId  (required) - Unique booking identifier
 * 
 * Response: { success, clientSecret, paymentIntentId, amount, currency, timestamp, error? }
 */
app.post('/api/create-payment', async (req, res) => {
  const startTime = Date.now();
  const { amount, currency = 'usd', bookingId } = req.body;

  // Input validation
  const validation = validatePayment({ amount, currency, bookingId });
  if (!validation.valid) {
    console.warn(`[⚠] Payment validation failed: ${validation.error}`);
    return res.status(400).json({
      success: false,
      error: validation.error,
      details: validation.details,
      required: {
        amount: 'positive integer in cents (e.g., 25000 = $250.00)',
        currency: 'usd, eur, gbp, jpy, cad, aud',
        bookingId: 'unique string identifier'
      },
      received: { amount, currency, bookingId }
    });
  }

  try {
    if (!stripe) {
      console.warn('[⚠] Stripe not configured');
      return res.status(503).json({
        success: false,
        error: 'Payment service unavailable',
        details: 'Stripe is not configured on this server',
        suggestion: 'Contact support to enable payment processing'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)),
      currency: currency.toLowerCase(),
      metadata: {
        bookingId,
        createdAt: new Date().toISOString()
      }
    });

    const duration = Date.now() - startTime;

    console.log(`[✓] Payment intent created: ${paymentIntent.id} (${bookingId})`);
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      bookingId,
      status: paymentIntent.status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[✗] Payment creation error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
      details: err.message,
      suggestion: 'Please verify payment details and try again. Contact support if error persists.'
    });
  }
});

/**
 * ========================================
 * AFFILIATE SYSTEM ENDPOINTS
 * ========================================
 */

// Import affiliate system
const affiliateSystem = require('./base44-actions/affiliate');

/**
 * POST /api/affiliate/register
 * Create a new affiliate account
 */
app.post('/api/affiliate/register', async (req, res) => {
  try {
    const { email, name, website, bankAccount } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['email', 'name', 'website', 'bankAccount']
      });
    }

    const result = affiliateSystem.createAffiliate({
      email,
      name,
      website,
      bankAccount
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('[✗] Affiliate registration error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create affiliate account',
      details: err.message
    });
  }
});

/**
 * POST /api/affiliate/link
 * Generate an affiliate tracking link
 */
app.post('/api/affiliate/link', async (req, res) => {
  try {
    const { affiliateId, productType, productData } = req.body;

    if (!affiliateId || !productType || !productData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['affiliateId', 'productType', 'productData']
      });
    }

    const result = affiliateSystem.generateAffiliateLink(affiliateId, productType, productData);
    res.json(result);
  } catch (err) {
    console.error('[✗] Link generation error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate affiliate link',
      details: err.message
    });
  }
});

/**
 * POST /api/affiliate/click
 * Track affiliate link click
 */
app.post('/api/affiliate/click', async (req, res) => {
  try {
    const { trackingId } = req.body;

    if (!trackingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing trackingId'
      });
    }

    const result = affiliateSystem.trackClick(trackingId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Click tracking error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to track click',
      details: err.message
    });
  }
});

/**
 * POST /api/affiliate/conversion
 * Record affiliate conversion (booking made)
 */
app.post('/api/affiliate/conversion', async (req, res) => {
  try {
    const { trackingId, bookingId, amount } = req.body;

    if (!trackingId || !bookingId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['trackingId', 'bookingId', 'amount']
      });
    }

    const result = affiliateSystem.recordConversion(trackingId, {
      bookingId,
      amount
    });

    res.json(result);
  } catch (err) {
    console.error('[✗] Conversion recording error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to record conversion',
      details: err.message
    });
  }
});

/**
 * GET /api/affiliate/dashboard/:affiliateId
 * Get affiliate dashboard with stats
 */
app.get('/api/affiliate/dashboard/:affiliateId', async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const result = affiliateSystem.getAffiliateDashboard(affiliateId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Dashboard error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard',
      details: err.message
    });
  }
});

/**
 * GET /api/affiliate/top
 * Get top earning affiliates
 */
app.get('/api/affiliate/top', async (req, res) => {
  try {
    const result = affiliateSystem.getTopAffiliates();
    res.json(result);
  } catch (err) {
    console.error('[✗] Top affiliates error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load top affiliates',
      details: err.message
    });
  }
});

/**
 * ========================================
 * CHATBOT SYSTEM ENDPOINTS
 * ========================================
 */

// Import chatbot system
const chatbotSystem = require('./base44-actions/chatbot');

/**
 * POST /api/chatbot/message
 * Send message to chatbot, get AI response
 */
app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['userId', 'message']
      });
    }

    const result = await chatbotSystem.sendMessage(userId, message);
    res.json(result);
  } catch (err) {
    console.error('[✗] Chatbot error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Chatbot error',
      details: err.message
    });
  }
});

/**
 * GET /api/chatbot/history/:userId
 * Get conversation history for user
 */
app.get('/api/chatbot/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = chatbotSystem.getConversationHistory(userId);
    res.json(result);
  } catch (err) {
    console.error('[✗] History error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load history',
      details: err.message
    });
  }
});

/**
 * GET /api/chatbot/stats
 * Get chatbot statistics
 */
app.get('/api/chatbot/stats', async (req, res) => {
  try {
    const result = chatbotSystem.getChatbotStats();
    res.json(result);
  } catch (err) {
    console.error('[✗] Stats error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load stats',
      details: err.message
    });
  }
});

/**
 * ========================================
 * 24/7 SUPPORT SYSTEM ENDPOINTS
 * ========================================
 */

// Import support system
const supportSystem = require('./base44-actions/support');

// Import new protection systems
const smsNotifications = require('./base44-actions/sms-notifications');
const legalTerms = require('./base44-actions/legal-terms');
const trustBadges = require('./base44-actions/trust-badges');
const bookingProtection = require('./base44-actions/booking-protection');

// Import new growth & monetization systems
const loyaltyProgram = require('./base44-actions/loyalty-program');
const referralSystem = require('./base44-actions/referral-system');
const paymentPlans = require('./base44-actions/payment-plans');
const activitiesSystem = require('./base44-actions/activities');
const emailMarketing = require('./base44-actions/email-marketing');
const analyticsSystem = require('./base44-actions/analytics');

// NEW TOP 10 SYSTEMS (Advanced Features)
const mobileApp = require('./base44-actions/mobile-app');
const multiLanguage = require('./base44-actions/multi-language');
const aiTravelAdvisor = require('./base44-actions/ai-travel-advisor');
const customerReviews = require('./base44-actions/customer-reviews');
const subscriptionPlans = require('./base44-actions/subscription-plans');
const globalPayments = require('./base44-actions/global-payments');
const travelInsurance = require('./base44-actions/travel-insurance');
const realTimeNotifications = require('./base44-actions/real-time-notifications');
const personalizationEngine = require('./base44-actions/personalization-engine');
const advancedSearch = require('./base44-actions/advanced-search');
const whiteLabel = require('./base44-actions/white-label');

/**
 * POST /api/support/ticket
 * Create a new support ticket
 */
app.post('/api/support/ticket', async (req, res) => {
  try {
    const { userId, email, phoneNumber, issue, description, bookingReference } = req.body;

    if (!userId || !email || !issue || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['userId', 'email', 'issue', 'description']
      });
    }

    const result = supportSystem.createTicket({
      userId,
      email,
      phoneNumber,
      issue,
      description,
      bookingReference
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('[✗] Ticket creation error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create ticket',
      details: err.message
    });
  }
});

/**
 * GET /api/support/ticket/:ticketId
 * Get ticket details and conversation
 */
app.get('/api/support/ticket/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = supportSystem.getTicket(ticketId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Ticket retrieval error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve ticket',
      details: err.message
    });
  }
});

/**
 * POST /api/support/ticket/:ticketId/message
 * Add message to support ticket
 */
app.post('/api/support/ticket/:ticketId/message', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { from, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const result = supportSystem.addTicketMessage(ticketId, {
      from: from || 'user',
      message
    });

    res.json(result);
  } catch (err) {
    console.error('[✗] Message error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to add message',
      details: err.message
    });
  }
});

/**
 * PUT /api/support/ticket/:ticketId/status
 * Update ticket status
 */
app.put('/api/support/ticket/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        validStatuses: ['open', 'in-progress', 'waiting-user', 'resolved', 'closed']
      });
    }

    const result = supportSystem.updateTicketStatus(ticketId, status);
    res.json(result);
  } catch (err) {
    console.error('[✗] Status update error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      details: err.message
    });
  }
});

/**
 * GET /api/support/tickets/:userId
 * Get all tickets for a user
 */
app.get('/api/support/tickets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const result = supportSystem.getUserTickets(userId, status);
    res.json(result);
  } catch (err) {
    console.error('[✗] Tickets retrieval error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tickets',
      details: err.message
    });
  }
});

/**
 * GET /api/support/dashboard
 * Get support team dashboard (admin only)
 */
app.get('/api/support/dashboard', async (req, res) => {
  try {
    const result = supportSystem.getSupportDashboard();
    res.json(result);
  } catch (err) {
    console.error('[✗] Dashboard error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard',
      details: err.message
    });
  }
});

/**
 * ========================================
 * SMS NOTIFICATIONS SYSTEM ENDPOINTS
 * ========================================
 */

/**
 * POST /api/sms/send
 * Send SMS notification to customer phone
 */
app.post('/api/sms/send', async (req, res) => {
  try {
    const { phoneNumber, smsType, bookingData } = req.body;

    if (!phoneNumber || !smsType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['phoneNumber', 'smsType'],
        availableTypes: ['booking_confirmed', 'payment_received', 'flight_confirmation', 'hotel_confirmation', 'payment_failed', 'booking_reminder', 'cancellation_available', 'support_available', 'refund_initiated', 'security_alert']
      });
    }

    const result = smsNotifications.sendSMS(phoneNumber, smsType, bookingData);
    res.json(result);
  } catch (err) {
    console.error('[✗] SMS sending error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      details: err.message
    });
  }
});

/**
 * POST /api/sms/send-security
 * Send security assurance SMS
 */
app.post('/api/sms/send-security', async (req, res) => {
  try {
    const { phoneNumber, customerName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const result = smsNotifications.sendSecurityAssurance(phoneNumber, customerName);
    res.json(result);
  } catch (err) {
    console.error('[✗] Security SMS error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send security SMS',
      details: err.message
    });
  }
});

/**
 * GET /api/sms/log/:phoneNumber
 * Get SMS log for phone number
 */
app.get('/api/sms/log/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const result = smsNotifications.getSMSLog(phoneNumber);
    res.json(result);
  } catch (err) {
    console.error('[✗] SMS log error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve SMS log',
      details: err.message
    });
  }
});

/**
 * GET /api/sms/statistics
 * Get SMS system statistics
 */
app.get('/api/sms/statistics', async (req, res) => {
  try {
    const result = smsNotifications.getSMSStatistics();
    res.json(result);
  } catch (err) {
    console.error('[✗] SMS statistics error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load statistics',
      details: err.message
    });
  }
});

/**
 * ========================================
 * LEGAL DOCUMENTS & CONTRACTS ENDPOINTS
 * ========================================
 */

/**
 * GET /api/legal/documents
 * Get all legal documents (Terms, Privacy, Cancellation)
 */
app.get('/api/legal/documents', async (req, res) => {
  try {
    const result = legalTerms.generateLegalDocuments();
    res.json(result);
  } catch (err) {
    console.error('[✗] Legal documents error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve legal documents',
      details: err.message
    });
  }
});

/**
 * GET /api/legal/documents/:docType
 * Get specific legal document (terms, privacy, cancellation)
 */
app.get('/api/legal/documents/:docType', async (req, res) => {
  try {
    const { docType } = req.params;
    const result = legalTerms.getLegalDocument(docType);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('[✗] Legal document error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve legal document',
      details: err.message
    });
  }
});

/**
 * POST /api/legal/agreement
 * Generate customer agreement
 */
app.post('/api/legal/agreement', async (req, res) => {
  try {
    const { customerId, customerName, email, bookingDetails } = req.body;

    if (!customerId || !customerName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['customerId', 'customerName', 'email']
      });
    }

    const result = legalTerms.generateCustomerAgreement({
      customerId,
      customerName,
      email,
      bookingDetails
    });

    res.json(result);
  } catch (err) {
    console.error('[✗] Agreement generation error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate agreement',
      details: err.message
    });
  }
});

/**
 * GET /api/legal/summary
 * Get legal documents summary
 */
app.get('/api/legal/summary', async (req, res) => {
  try {
    const result = legalTerms.getLegalDocumentsSummary();
    res.json(result);
  } catch (err) {
    console.error('[✗] Summary error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load summary',
      details: err.message
    });
  }
});

/**
 * ========================================
 * TRUST & SAFETY BADGES ENDPOINTS
 * ========================================
 */

/**
 * GET /api/trust/badges
 * Get all security badges and guarantees
 */
app.get('/api/trust/badges', async (req, res) => {
  try {
    const result = trustBadges.getAllBadgesAndGuarantees();
    res.json(result);
  } catch (err) {
    console.error('[✗] Badges error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve badges',
      details: err.message
    });
  }
});

/**
 * GET /api/trust/certifications
 * Get security certifications
 */
app.get('/api/trust/certifications', async (req, res) => {
  try {
    const result = trustBadges.getCertifications();
    res.json(result);
  } catch (err) {
    console.error('[✗] Certifications error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve certifications',
      details: err.message
    });
  }
});

/**
 * GET /api/trust/html-badges
 * Get HTML code for badges to embed on website
 */
app.get('/api/trust/html-badges', async (req, res) => {
  try {
    const result = trustBadges.getHTMLBadges();
    res.json(result);
  } catch (err) {
    console.error('[✗] HTML badges error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate HTML badges',
      details: err.message
    });
  }
});

/**
 * GET /api/trust/score
 * Get overall trust score
 */
app.get('/api/trust/score', async (req, res) => {
  try {
    const result = trustBadges.calculateTrustScore();
    res.json(result);
  } catch (err) {
    console.error('[✗] Trust score error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate trust score',
      details: err.message
    });
  }
});

/**
 * ========================================
 * BOOKING PROTECTION SYSTEM ENDPOINTS
 * ========================================
 */

/**
 * GET /api/protection/plans
 * Get all protection plans available
 */
app.get('/api/protection/plans', async (req, res) => {
  try {
    const result = bookingProtection.getProtectionPlans();
    res.json(result);
  } catch (err) {
    console.error('[✗] Protection plans error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve protection plans',
      details: err.message
    });
  }
});

/**
 * GET /api/protection/plans/:planKey
 * Get specific protection plan details
 */
app.get('/api/protection/plans/:planKey', async (req, res) => {
  try {
    const { planKey } = req.params;
    const result = bookingProtection.getProtectionPlanDetails(planKey);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('[✗] Plan details error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve plan details',
      details: err.message
    });
  }
});

/**
 * POST /api/protection/add
 * Add protection to booking
 */
app.post('/api/protection/add', async (req, res) => {
  try {
    const { bookingId, userId, bookingAmount, protectionPlan } = req.body;

    if (!bookingId || !userId || !bookingAmount || !protectionPlan) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['bookingId', 'userId', 'bookingAmount', 'protectionPlan']
      });
    }

    const result = bookingProtection.addBookingProtection({
      bookingId,
      userId,
      bookingAmount,
      protectionPlan
    });

    res.json(result);
  } catch (err) {
    console.error('[✗] Protection addition error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to add protection',
      details: err.message
    });
  }
});

/**
 * POST /api/protection/claim
 * File an insurance claim
 */
app.post('/api/protection/claim', async (req, res) => {
  try {
    const { protectionId, bookingId, claimType, claimAmount, description, contactPhone } = req.body;

    if (!protectionId || !claimType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['protectionId', 'claimType'],
        claimTypes: ['cancellation', 'delay', 'medical', 'other']
      });
    }

    const result = bookingProtection.fileInsuranceClaim({
      protectionId,
      bookingId,
      claimType,
      claimAmount,
      description,
      contactPhone
    });

    res.json(result);
  } catch (err) {
    console.error('[✗] Claim filing error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to file claim',
      details: err.message
    });
  }
});

/**
 * GET /api/protection/claim/:claimId
 * Get claim status
 */
app.get('/api/protection/claim/:claimId', async (req, res) => {
  try {
    const { claimId } = req.params;
    const result = bookingProtection.getClaimStatus(claimId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('[✗] Claim status error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve claim status',
      details: err.message
    });
  }
});

/**
 * GET /api/protection/guarantees
 * Get all special guarantees
 */
app.get('/api/protection/guarantees', async (req, res) => {
  try {
    const result = bookingProtection.getSpecialGuarantees();
    res.json(result);
  } catch (err) {
    console.error('[✗] Guarantees error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve guarantees',
      details: err.message
    });
  }
});

/**
 * GET /api/protection/info
 * Get protection info and recommendations for website
 */
app.get('/api/protection/info', async (req, res) => {
  try {
    const result = bookingProtection.getProtectionInfo();
    res.json(result);
  } catch (err) {
    console.error('[✗] Protection info error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load protection info',
      details: err.message
    });
  }
});

/**
 * ============================================================================
 * LOYALTY PROGRAM ENDPOINTS
 * ============================================================================
 */

/**
 * POST /api/loyalty/member
 * Create or get loyalty member
 */
app.post('/api/loyalty/member', async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    if (!userId || !email || !name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const member = loyaltyProgram.getOrCreateMember(userId, email, name);
    res.json({ success: true, member });
  } catch (err) {
    console.error('[✗] Loyalty member error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/loyalty/details/:userId
 * Get member details and tier info
 */
app.get('/api/loyalty/details/:userId', async (req, res) => {
  try {
    const result = loyaltyProgram.getMemberDetails(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Loyalty details error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/loyalty/booking
 * Record booking and award points
 */
app.post('/api/loyalty/booking', async (req, res) => {
  try {
    const { userId, email, name, bookingAmount, bookingType } = req.body;
    if (!userId || !bookingAmount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const result = loyaltyProgram.recordBooking(userId, email, name, bookingAmount, bookingType);
    res.json(result);
  } catch (err) {
    console.error('[✗] Loyalty booking error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/loyalty/tiers
 * Get all loyalty tiers
 */
app.get('/api/loyalty/tiers', async (req, res) => {
  try {
    const result = loyaltyProgram.getAllTiers();
    res.json(result);
  } catch (err) {
    console.error('[✗] Loyalty tiers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/loyalty/redeem
 * Redeem loyalty points
 */
app.post('/api/loyalty/redeem', async (req, res) => {
  try {
    const { userId, redemptionKey } = req.body;
    if (!userId || !redemptionKey) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const result = loyaltyProgram.redeemPoints(userId, redemptionKey);
    res.json(result);
  } catch (err) {
    console.error('[✗] Loyalty redeem error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/loyalty/leaderboard
 * Get loyalty leaderboard
 */
app.get('/api/loyalty/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const result = loyaltyProgram.getLeaderboard(limit);
    res.json(result);
  } catch (err) {
    console.error('[✗] Loyalty leaderboard error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ============================================================================
 * REFERRAL SYSTEM ENDPOINTS
 * ============================================================================
 */

/**
 * POST /api/referral/generate
 * Generate referral code
 */
app.post('/api/referral/generate', async (req, res) => {
  try {
    const { userId, userName } = req.body;
    if (!userId || !userName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const result = referralSystem.generateReferralCode(userId, userName);
    res.json(result);
  } catch (err) {
    console.error('[✗] Referral generation error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/referral/link
 * Create referral link with tracking
 */
app.post('/api/referral/link', async (req, res) => {
  try {
    const { userId, campaignName, medium } = req.body;
    const result = referralSystem.createReferralLink(userId, campaignName, medium);
    res.json(result);
  } catch (err) {
    console.error('[✗] Referral link error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/referral/convert
 * Convert referral to customer
 */
app.post('/api/referral/convert', async (req, res) => {
  try {
    const { referralCode, newUserId, newUserEmail, newUserName } = req.body;
    const result = referralSystem.convertReferral(referralCode, newUserId, newUserEmail, newUserName);
    res.json(result);
  } catch (err) {
    console.error('[✗] Referral convert error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/referral/stats/:userId
 * Get referral stats
 */
app.get('/api/referral/stats/:userId', async (req, res) => {
  try {
    const result = referralSystem.getReferralStats(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Referral stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/referral/top
 * Get top referrers
 */
app.get('/api/referral/top', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const result = referralSystem.getTopReferrers(limit);
    res.json(result);
  } catch (err) {
    console.error('[✗] Top referrers error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ============================================================================
 * PAYMENT PLANS ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/payment-plans/available
 * Get available payment plans
 */
app.get('/api/payment-plans/available', async (req, res) => {
  try {
    const { bookingValue } = req.query;
    if (!bookingValue) {
      return res.status(400).json({ success: false, error: 'Missing bookingValue' });
    }
    const result = paymentPlans.getAvailablePlans(parseFloat(bookingValue));
    res.json(result);
  } catch (err) {
    console.error('[✗] Payment plans error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/payment-plans/create-agreement
 * Create payment plan agreement
 */
app.post('/api/payment-plans/create-agreement', async (req, res) => {
  try {
    const { userId, bookingId, bookingValue, planId, paymentMethod } = req.body;
    const result = paymentPlans.createPaymentAgreement(userId, bookingId, bookingValue, planId, paymentMethod);
    res.json(result);
  } catch (err) {
    console.error('[✗] Payment agreement error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/payment-plans/process-payment
 * Process payment for installment
 */
app.post('/api/payment-plans/process-payment', async (req, res) => {
  try {
    const { agreementId, amount, paymentMethod, transactionId } = req.body;
    const result = paymentPlans.processPayment(agreementId, amount, paymentMethod, transactionId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Process payment error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/payment-plans/agreement/:agreementId
 * Get payment agreement details
 */
app.get('/api/payment-plans/agreement/:agreementId', async (req, res) => {
  try {
    const result = paymentPlans.getAgreementDetails(req.params.agreementId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Agreement details error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/payment-plans/user/:userId
 * Get user's active agreements
 */
app.get('/api/payment-plans/user/:userId', async (req, res) => {
  try {
    const result = paymentPlans.getUserAgreements(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error('[✗] User agreements error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ============================================================================
 * ACTIVITIES & EXPERIENCES ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/activities/search
 * Search activities
 */
app.get('/api/activities/search', async (req, res) => {
  try {
    const { destination, category, maxPrice, date } = req.query;
    const result = activitiesSystem.searchActivities(destination, category, maxPrice, date);
    res.json(result);
  } catch (err) {
    console.error('[✗] Activities search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/activities/:activityId
 * Get activity details
 */
app.get('/api/activities/:activityId', async (req, res) => {
  try {
    const result = activitiesSystem.getActivityDetails(req.params.activityId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Activity details error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/activities/book
 * Book an activity
 */
app.post('/api/activities/book', async (req, res) => {
  try {
    const { userId, activityId, date, groupSize, specialRequests } = req.body;
    const result = activitiesSystem.bookActivity(userId, activityId, date, groupSize, specialRequests);
    res.json(result);
  } catch (err) {
    console.error('[✗] Activity booking error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/activities/favorites
 * Add activity to favorites
 */
app.post('/api/activities/favorites', async (req, res) => {
  try {
    const { userId, activityId } = req.body;
    const result = activitiesSystem.addToFavorites(userId, activityId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Add to favorites error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/activities/favorites/:userId
 * Get user favorites
 */
app.get('/api/activities/favorites/:userId', async (req, res) => {
  try {
    const result = activitiesSystem.getUserFavorites(req.params.userId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Favorites error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/activities/review
 * Leave activity review
 */
app.post('/api/activities/review', async (req, res) => {
  try {
    const { userId, userName, activityId, rating, title, comment } = req.body;
    const result = activitiesSystem.leaveReview(userId, userName, activityId, rating, title, comment);
    res.json(result);
  } catch (err) {
    console.error('[✗] Review error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/activities/recommendations
 * Get activity recommendations
 */
app.get('/api/activities/recommendations', async (req, res) => {
  try {
    const { destination, category, budget } = req.query;
    const result = activitiesSystem.getRecommendations(destination, category, budget);
    res.json(result);
  } catch (err) {
    console.error('[✗] Recommendations error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/activities/popular
 * Get popular activities
 */
app.get('/api/activities/popular', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const result = activitiesSystem.getPopularActivities(limit);
    res.json(result);
  } catch (err) {
    console.error('[✗] Popular activities error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ============================================================================
 * EMAIL MARKETING ENDPOINTS
 * ============================================================================
 */

/**
 * POST /api/email/subscribe
 * Subscribe to email marketing
 */
app.post('/api/email/subscribe', async (req, res) => {
  try {
    const { userId, email, userName, preferences } = req.body;
    const result = emailMarketing.subscribeToEmails(userId, email, userName, preferences);
    res.json(result);
  } catch (err) {
    console.error('[✗] Email subscribe error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/send-triggered
 * Send triggered email
 */
app.post('/api/email/send-triggered', async (req, res) => {
  try {
    const { userId, email, trigger, data } = req.body;
    const result = emailMarketing.sendTriggeredEmail(userId, email, trigger, data);
    res.json(result);
  } catch (err) {
    console.error('[✗] Send email error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/campaign
 * Create email campaign
 */
app.post('/api/email/campaign', async (req, res) => {
  try {
    const { campaignName, templateId, targetAudience, sendTime } = req.body;
    const result = emailMarketing.createEmailCampaign(campaignName, templateId, targetAudience, sendTime);
    res.json(result);
  } catch (err) {
    console.error('[✗] Campaign creation error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/email/templates
 * Get available templates
 */
app.get('/api/email/templates', async (req, res) => {
  try {
    const result = emailMarketing.getEmailTemplates();
    res.json(result);
  } catch (err) {
    console.error('[✗] Templates error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/email/stats
 * Get email stats
 */
app.get('/api/email/stats', async (req, res) => {
  try {
    const userId = req.query.userId;
    const result = emailMarketing.getEmailStats(userId);
    res.json(result);
  } catch (err) {
    console.error('[✗] Email stats error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ============================================================================
 * ANALYTICS ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/analytics/dashboard
 * Get analytics dashboard
 */
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const result = analyticsSystem.getDashboardMetrics(period);
    res.json(result);
  } catch (err) {
    console.error('[✗] Analytics dashboard error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/analytics/track-view
 * Track page view
 */
app.post('/api/analytics/track-view', async (req, res) => {
  try {
    const { userId, page, referrer, device } = req.body;
    const result = analyticsSystem.trackPageView(userId, page, referrer, device);
    res.json(result);
  } catch (err) {
    console.error('[✗] Track view error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/analytics/track-activity
 * Track user activity
 */
app.post('/api/analytics/track-activity', async (req, res) => {
  try {
    const { userId, activityType, metadata } = req.body;
    const result = analyticsSystem.trackUserActivity(userId, activityType, metadata);
    res.json(result);
  } catch (err) {
    console.error('[✗] Track activity error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analytics/funnel
 * Get funnel analysis
 */
app.get('/api/analytics/funnel', async (req, res) => {
  try {
    const result = analyticsSystem.getFunnelAnalysis();
    res.json(result);
  } catch (err) {
    console.error('[✗] Funnel analysis error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analytics/cohort
 * Get cohort analysis
 */
app.get('/api/analytics/cohort', async (req, res) => {
  try {
    const result = analyticsSystem.getCohortAnalysis();
    res.json(result);
  } catch (err) {
    console.error('[✗] Cohort analysis error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analytics/devices
 * Get device analytics
 */
app.get('/api/analytics/devices', async (req, res) => {
  try {
    const result = analyticsSystem.getDeviceAnalytics();
    res.json(result);
  } catch (err) {
    console.error('[✗] Device analytics error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analytics/trends
 * Get analytics trends
 */
app.get('/api/analytics/trends', async (req, res) => {
  try {
    const { metric, days } = req.query;
    const result = analyticsSystem.getTrends(metric, days);
    res.json(result);
  } catch (err) {
    console.error('[✗] Trends error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Validation and utility functions
 */

/**
 * Validate flight search parameters
 */
function validateFlightSearch({ origin, destination, date, passengers }) {
  if (!origin) {
    return { valid: false, error: 'Missing origin', details: 'Origin airport code required (e.g., TLV)' };
  }
  if (!destination) {
    return { valid: false, error: 'Missing destination', details: 'Destination airport code required' };
  }
  if (!date) {
    return { valid: false, error: 'Missing date', details: 'Departure date required (YYYY-MM-DD)' };
  }

  if (!/^[A-Z]{3}$/i.test(origin.trim())) {
    return { valid: false, error: 'Invalid origin', details: 'Origin must be 3-letter code (e.g., TLV, NYC)' };
  }
  if (!/^[A-Z]{3}$/i.test(destination.trim())) {
    return { valid: false, error: 'Invalid destination', details: 'Destination must be 3-letter code' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, error: 'Invalid date format', details: 'Use YYYY-MM-DD (e.g., 2025-12-25)' };
  }

  const searchDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (searchDate < today) {
    return { valid: false, error: 'Date in past', details: 'Departure date must be in the future' };
  }

  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  if (searchDate > maxDate) {
    return { valid: false, error: 'Date too far', details: 'Maximum booking window is 2 years' };
  }

  const passengerCount = parseInt(passengers) || 1;
  if (isNaN(passengerCount) || passengerCount < 1 || passengerCount > 9) {
    return { valid: false, error: 'Invalid passengers', details: 'Passenger count must be 1-9' };
  }

  return { valid: true };
}

/**
 * Validate hotel search parameters
 */
function validateHotelSearch({ cityCode, checkIn, checkOut, guests }) {
  if (!cityCode) {
    return { valid: false, error: 'Missing cityCode', details: 'City code required (e.g., NYC)' };
  }
  if (!checkIn) {
    return { valid: false, error: 'Missing checkIn', details: 'Check-in date required (YYYY-MM-DD)' };
  }
  if (!checkOut) {
    return { valid: false, error: 'Missing checkOut', details: 'Check-out date required (YYYY-MM-DD)' };
  }

  if (!/^[A-Z]{3}$/i.test(cityCode.trim())) {
    return { valid: false, error: 'Invalid cityCode', details: 'City code must be 3 letters (e.g., NYC, LON)' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn)) {
    return { valid: false, error: 'Invalid checkIn format', details: 'Use YYYY-MM-DD (e.g., 2025-12-20)' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return { valid: false, error: 'Invalid checkOut format', details: 'Use YYYY-MM-DD (e.g., 2025-12-25)' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return { valid: false, error: 'Check-in in past', details: 'Check-in date must be in the future' };
  }
  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Invalid date range', details: 'Check-out must be after check-in' };
  }

  const nights = Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  if (nights > 90) {
    return { valid: false, error: 'Stay too long', details: 'Maximum stay is 90 days' };
  }

  const guestCount = parseInt(guests) || 1;
  if (isNaN(guestCount) || guestCount < 1 || guestCount > 9) {
    return { valid: false, error: 'Invalid guests', details: 'Guest count must be 1-9' };
  }

  return { valid: true };
}

/**
 * Validate payment parameters
 */
function validatePayment({ amount, currency, bookingId }) {
  if (!amount) {
    return { valid: false, error: 'Missing amount', details: 'Amount in cents required (e.g., 25000)' };
  }
  if (!bookingId) {
    return { valid: false, error: 'Missing bookingId', details: 'Unique booking ID required' };
  }

  const amountNum = parseInt(amount);
  if (isNaN(amountNum) || amountNum < 100) {
    return { valid: false, error: 'Invalid amount', details: 'Minimum amount is 100 cents ($1.00)' };
  }
  if (amountNum > 99999900) {
    return { valid: false, error: 'Amount too large', details: 'Maximum amount is 999,999.00' };
  }

  const validCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud'];
  if (!validCurrencies.includes(currency?.toLowerCase())) {
    return { 
      valid: false, 
      error: 'Invalid currency', 
      details: `Supported: ${validCurrencies.join(', ')}`
    };
  }

  if (typeof bookingId !== 'string' || bookingId.length < 3) {
    return { valid: false, error: 'Invalid bookingId', details: 'Booking ID must be 3+ characters' };
  }

  return { valid: true };
}

/**
 * Sort flights
 */
function sortFlights(flights, sortBy) {
  const sorted = [...flights];
  
  switch (sortBy?.toLowerCase()) {
    case 'duration':
      return sorted.sort((a, b) => {
        const aDuration = parseInt(a.duration) || 0;
        const bDuration = parseInt(b.duration) || 0;
        return aDuration - bDuration;
      });
    case 'airline':
      return sorted.sort((a, b) => (a.airline || '').localeCompare(b.airline || ''));
    case 'stops':
      return sorted.sort((a, b) => a.stops - b.stops);
    case 'price':
    default:
      return sorted.sort((a, b) => a.pricePerPassenger - b.pricePerPassenger);
  }
}

/**
 * Sort hotels
 */
function sortHotels(hotels, sortBy) {
  const sorted = [...hotels];
  
  switch (sortBy?.toLowerCase()) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'price':
    default:
      return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
  }
}

/**
 * Global error handlers
 */

/**
 * 404 Not Found handler
 */
app.use((req, res) => {
  console.warn(`[⚠] 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    suggestion: 'Check the API documentation at GET /'
  });
});

/**
 * Global error handler
 * Catches all unhandled errors from middleware and route handlers
 */
app.use((err, req, res, next) => {
  console.error('[✗] Unhandled error:', err.message);
  console.error('    Stack:', err.stack);

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      details: 'This origin is not allowed to access this API',
      origin: req.get('origin'),
      suggestion: 'Contact support to add your domain to allowed origins'
    });
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      details: err.message,
      suggestion: 'Verify your request body is valid JSON'
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========== MOBILE APP ENDPOINTS ==========

/**
 * POST /api/mobile/register-device
 * Register a new device (iOS/Android)
 */
app.post('/api/mobile/register-device', (req, res) => {
  try {
    const { userId, deviceType, osVersion, appVersion, deviceToken } = req.body;
    const device = mobileApp.registerDevice(userId, deviceType, osVersion, appVersion, deviceToken);
    res.json({ success: true, device });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/mobile/session
 * Create a mobile session
 */
app.post('/api/mobile/session', (req, res) => {
  try {
    const { userId, deviceId, sessionToken } = req.body;
    const session = mobileApp.createSession(userId, deviceId, sessionToken);
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/mobile/push-token
 * Register push notification token
 */
app.post('/api/mobile/push-token', (req, res) => {
  try {
    const { userId, deviceId, pushToken, platform } = req.body;
    const token = mobileApp.registerPushToken(userId, deviceId, pushToken, platform);
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/mobile/wallet/:userId
 * Get mobile wallet items
 */
app.get('/api/mobile/wallet/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const items = mobileApp.getWalletItems(userId);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/mobile/wallet
 * Add item to wallet
 */
app.post('/api/mobile/wallet', (req, res) => {
  try {
    const { userId, itemType, itemData } = req.body;
    const item = mobileApp.addToWallet(userId, itemType, itemData);
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/mobile/biometric
 * Enable biometric authentication
 */
app.post('/api/mobile/biometric', (req, res) => {
  try {
    const { userId, deviceId, biometricType, publicKey } = req.body;
    const bio = mobileApp.enableBiometric(userId, deviceId, biometricType, publicKey);
    res.json({ success: true, biometric: bio });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/mobile/analytics/:userId
 * Get mobile app analytics
 */
app.get('/api/mobile/analytics/:userId', (req, res) => {
  try {
    const analytics = mobileApp.getAppAnalytics(7);
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== MULTI-LANGUAGE ENDPOINTS ==========

/**
 * GET /api/languages
 * Get all supported languages
 */
app.get('/api/languages', (req, res) => {
  try {
    const languages = multiLanguage.getSupportedLanguages();
    res.json({ success: true, languages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/language/set/:userId
 * Set user language preference
 */
app.post('/api/language/set/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { languageCode } = req.body;
    const result = multiLanguage.setUserLanguage(userId, languageCode);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/currency/convert
 * Convert currency
 */
app.get('/api/currency/convert', (req, res) => {
  try {
    const { amount, from, to } = req.query;
    const converted = multiLanguage.convertCurrency(amount, from, to);
    res.json({ success: true, from, to, amount, converted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/locale/:languageCode
 * Get locale information
 */
app.get('/api/locale/:languageCode', (req, res) => {
  try {
    const { languageCode } = req.params;
    const locale = multiLanguage.getLocaleInfo(languageCode);
    res.json({ success: true, locale });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== AI TRAVEL ADVISOR ENDPOINTS ==========

/**
 * POST /api/ai-advisor/chat/start
 * Start conversation with AI advisor
 */
app.post('/api/ai-advisor/chat/start', (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = aiTravelAdvisor.startConversation(userId);
    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai-advisor/chat/message
 * Send message to AI advisor
 */
app.post('/api/ai-advisor/chat/message', (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const response = aiTravelAdvisor.sendMessage(conversationId, message);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai-advisor/recommendations/:userId
 * Get AI recommendations for user
 */
app.get('/api/ai-advisor/recommendations/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const rec = aiTravelAdvisor.getRecommendations(userId);
    res.json({ success: true, recommendations: rec });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai-advisor/destination/:destination
 * Get destination insights from AI advisor
 */
app.get('/api/ai-advisor/destination/:destination', (req, res) => {
  try {
    const { destination } = req.params;
    const insights = aiTravelAdvisor.getDestinationInsights(destination);
    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== CUSTOMER REVIEWS ENDPOINTS ==========

/**
 * POST /api/reviews
 * Create a new review
 */
app.post('/api/reviews', (req, res) => {
  try {
    const { userId, bookingId, productType, productId, rating, title, comment } = req.body;
    const review = customerReviews.createReview(userId, bookingId, productType, productId, rating, title, comment);
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reviews/product/:productId
 * Get reviews for a product
 */
app.get('/api/reviews/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { productType } = req.query;
    const reviews = customerReviews.getProductReviews(productId, productType);
    const rating = customerReviews.calculateProductRating(productId, productType);
    res.json({ success: true, reviews, rating });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get user's reviews
 */
app.get('/api/reviews/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = customerReviews.getUserReviews(userId);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reviews/:reviewId/helpful
 * Mark review as helpful
 */
app.post('/api/reviews/:reviewId/helpful', (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, helpful } = req.body;
    const result = customerReviews.markHelpful(reviewId, userId, helpful);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reviews/analytics/:productId
 * Get review analytics
 */
app.get('/api/reviews/analytics/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { productType } = req.query;
    const analytics = customerReviews.getReviewAnalytics(productId, productType);
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== SUBSCRIPTION ENDPOINTS ==========

/**
 * POST /api/subscriptions
 * Create subscription
 */
app.post('/api/subscriptions', (req, res) => {
  try {
    const { userId, planType, paymentMethod, cardToken } = req.body;
    const subscription = subscriptionPlans.createSubscription(userId, planType, paymentMethod, cardToken);
    res.json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/subscriptions/:userId
 * Get user subscription
 */
app.get('/api/subscriptions/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = subscriptionPlans.getSubscription(userId);
    res.json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/subscriptions/plans
 * Get all subscription plans
 */
app.get('/api/subscriptions/plans', (req, res) => {
  try {
    const plans = subscriptionPlans.getAllPlans();
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/subscriptions/:userId/upgrade
 * Upgrade subscription
 */
app.post('/api/subscriptions/:userId/upgrade', (req, res) => {
  try {
    const { userId } = req.params;
    const { planType } = req.body;
    const subscription = subscriptionPlans.upgradeSubscription(userId, planType);
    res.json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/subscriptions/metrics
 * Get subscription metrics
 */
app.get('/api/subscriptions/metrics', (req, res) => {
  try {
    const metrics = subscriptionPlans.getSubscriptionMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== GLOBAL PAYMENTS ENDPOINTS ==========

/**
 * POST /api/payments/process
 * Process payment
 */
app.post('/api/payments/process', (req, res) => {
  try {
    const { userId, amount, currency, paymentMethod, paymentDetails } = req.body;
    const transaction = globalPayments.processPayment(userId, amount, currency, paymentMethod, paymentDetails);
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/payments/methods/:userCountry
 * Get available payment methods
 */
app.get('/api/payments/methods/:userCountry', (req, res) => {
  try {
    const { userCountry } = req.params;
    const methods = globalPayments.getAvailablePaymentMethods(userCountry);
    res.json({ success: true, methods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/payments/bnpl
 * Create BNPL plan
 */
app.post('/api/payments/bnpl', (req, res) => {
  try {
    const { userId, amount, currency, plan } = req.body;
    const bnpl = globalPayments.createBNPLPlan(userId, amount, currency, plan);
    res.json({ success: true, bnpl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/payments/history/:userId
 * Get payment history
 */
app.get('/api/payments/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = globalPayments.getTransactionHistory(userId);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== TRAVEL INSURANCE ENDPOINTS ==========

/**
 * GET /api/insurance/plans
 * Get insurance plans
 */
app.get('/api/insurance/plans', (req, res) => {
  try {
    const plans = travelInsurance.getPolicies();
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/insurance/policy
 * Create insurance policy
 */
app.post('/api/insurance/policy', (req, res) => {
  try {
    const { userId, bookingId, planType, tripDetails } = req.body;
    const policy = travelInsurance.createPolicy(userId, bookingId, planType, tripDetails);
    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/insurance/claim
 * File insurance claim
 */
app.post('/api/insurance/claim', (req, res) => {
  try {
    const { userId, policyId, claimType, description, amount } = req.body;
    const claim = travelInsurance.fileClaim(userId, policyId, claimType, description, amount);
    res.json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/insurance/claims/:userId
 * Get user claims
 */
app.get('/api/insurance/claims/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const claims = travelInsurance.getUserClaims(userId);
    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== NOTIFICATIONS ENDPOINTS ==========

/**
 * POST /api/notifications/preferences/:userId
 * Set notification preferences
 */
app.post('/api/notifications/preferences/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const prefs = realTimeNotifications.setNotificationPreferences(userId, req.body);
    res.json({ success: true, preferences: prefs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/notifications/price-alert
 * Create price alert
 */
app.post('/api/notifications/price-alert', (req, res) => {
  try {
    const { userId, flightRoute, maxPrice, expiryDate } = req.body;
    const alert = realTimeNotifications.createPriceAlert(userId, flightRoute, maxPrice, expiryDate);
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/notifications/history/:userId
 * Get notification history
 */
app.get('/api/notifications/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = realTimeNotifications.getNotificationHistory(userId);
    res.json({ success: true, notifications: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/notifications/analytics/:userId
 * Get notification analytics
 */
app.get('/api/notifications/analytics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = realTimeNotifications.getNotificationAnalytics(userId);
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== PERSONALIZATION ENDPOINTS ==========

/**
 * POST /api/personalization/profile/:userId
 * Create/update user profile
 */
app.post('/api/personalization/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const profile = personalizationEngine.updateUserProfile(userId, req.body);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/personalization/recommendations/:userId
 * Get personalized recommendations
 */
app.get('/api/personalization/recommendations/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = personalizationEngine.generatePersonalizedRecommendations(userId);
    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/personalization/track-view/:userId
 * Track destination view
 */
app.post('/api/personalization/track-view/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { destination, viewDuration } = req.body;
    personalizationEngine.trackDestinationView(userId, destination, viewDuration);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/personalization/seasonal/:userId
 * Get seasonal recommendations
 */
app.get('/api/personalization/seasonal/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const seasonal = personalizationEngine.getSeasonalRecommendations(userId);
    res.json({ success: true, seasonal });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== ADVANCED SEARCH ENDPOINTS ==========

/**
 * GET /api/search/filters/:productType
 * Get available filters
 */
app.get('/api/search/filters/:productType', (req, res) => {
  try {
    const { productType } = req.params;
    const filters = advancedSearch.getAvailableFilters(productType);
    res.json({ success: true, filters });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/search/apply-filters
 * Apply filters to products
 */
app.post('/api/search/apply-filters', (req, res) => {
  try {
    const { products, filters } = req.body;
    const filtered = advancedSearch.applyFilters(products, filters);
    res.json({ success: true, filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/search/save
 * Save search
 */
app.post('/api/search/save', (req, res) => {
  try {
    const { userId, searchName, filters, results } = req.body;
    const search = advancedSearch.saveSearch(userId, searchName, filters, results);
    res.json({ success: true, search });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/search/saved/:userId
 * Get saved searches
 */
app.get('/api/search/saved/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const searches = advancedSearch.getSavedSearches(userId);
    res.json({ success: true, searches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ========== WHITE-LABEL B2B ENDPOINTS ==========

/**
 * POST /api/white-label/partner
 * Create partner account
 */
app.post('/api/white-label/partner', (req, res) => {
  try {
    const { companyName, contactEmail, plan, details } = req.body;
    const partner = whiteLabel.createPartner(companyName, contactEmail, plan, details);
    res.json({ success: true, partner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/white-label/partner/:partnerId
 * Get partner details
 */
app.get('/api/white-label/partner/:partnerId', (req, res) => {
  try {
    const { partnerId } = req.params;
    const partner = whiteLabel.getPartner(partnerId);
    res.json({ success: true, partner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/white-label/brand
 * Create white-label branding
 */
app.post('/api/white-label/brand', (req, res) => {
  try {
    const { partnerId, brandConfig } = req.body;
    const brand = whiteLabel.createBrand(partnerId, brandConfig);
    res.json({ success: true, brand });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/white-label/api-key
 * Create API key
 */
app.post('/api/white-label/api-key', (req, res) => {
  try {
    const { partnerId, keyName, permissions } = req.body;
    const apiKey = whiteLabel.createAPIKey(partnerId, keyName, permissions);
    res.json({ success: true, apiKey });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/white-label/commissions/:partnerId
 * Get partner commissions
 */
app.get('/api/white-label/commissions/:partnerId', (req, res) => {
  try {
    const { partnerId } = req.params;
    const summary = whiteLabel.getCommissionSummary(partnerId);
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/white-label/analytics/:partnerId
 * Get partner analytics
 */
app.get('/api/white-label/analytics/:partnerId', (req, res) => {
  try {
    const { partnerId } = req.params;
    const analytics = whiteLabel.getPartnerAnalytics(partnerId, 30);
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Server startup
 */
const PORT = parseInt(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, '0.0.0.0', () => {
  const timestamp = new Date().toISOString();
  const divider = '═'.repeat(60);

  console.log(`\n${divider}`);
  console.log(`[✓] MyEagle Travel Booking API`);
  console.log(`${divider}`);
  console.log(`[✓] Server running: http://localhost:${PORT}`);
  console.log(`[✓] Environment: ${NODE_ENV}`);
  console.log(`[✓] Started: ${timestamp}`);
  console.log(`[✓] Process ID: ${process.pid}`);
  console.log(`${divider}`);
  console.log(`[✓] Available endpoints: 144 TOTAL`);
  console.log(`\n📌 CORE ENDPOINTS (3):`);
  console.log(`    GET  /                              - Health check`);
  console.log(`    GET  /api/flights                   - Search flights`);
  console.log(`    GET  /api/hotels                    - Search hotels`);
  console.log(`    POST /api/create-payment            - Create payment`);
  console.log(`\n📊 AFFILIATE SYSTEM (6):`);
  console.log(`    POST /api/affiliate/register        - Register affiliate`);
  console.log(`    POST /api/affiliate/link            - Generate affiliate link`);
  console.log(`    POST /api/affiliate/click           - Track click`);
  console.log(`    POST /api/affiliate/conversion      - Record conversion`);
  console.log(`    GET  /api/affiliate/dashboard/:id   - Affiliate dashboard`);
  console.log(`    GET  /api/affiliate/top             - Top affiliates`);
  console.log(`\n🤖 CHATBOT SYSTEM (3):`);
  console.log(`    POST /api/chatbot/message           - Send message to bot`);
  console.log(`    GET  /api/chatbot/history/:userId   - Chat history`);
  console.log(`    GET  /api/chatbot/stats             - Chatbot statistics`);
  console.log(`\n💬 SUPPORT SYSTEM (6):`);
  console.log(`    POST /api/support/ticket            - Create support ticket`);
  console.log(`    GET  /api/support/ticket/:id        - Get ticket details`);
  console.log(`    POST /api/support/ticket/:id/msg    - Add ticket message`);
  console.log(`    PUT  /api/support/ticket/:id/status - Update status`);
  console.log(`    GET  /api/support/tickets/:userId   - User tickets`);
  console.log(`    GET  /api/support/dashboard         - Support dashboard`);
  console.log(`\n📱 SMS SYSTEM (4):`);
  console.log(`    POST /api/sms/send                  - Send SMS notification`);
  console.log(`    POST /api/sms/send-security         - Send security assurance SMS`);
  console.log(`    GET  /api/sms/log/:phone            - SMS log`);
  console.log(`    GET  /api/sms/statistics            - SMS statistics`);
  console.log(`\n⚖️  LEGAL SYSTEM (4):`);
  console.log(`    GET  /api/legal/documents           - Get legal documents`);
  console.log(`    GET  /api/legal/documents/:type     - Get specific document`);
  console.log(`    POST /api/legal/agreement           - Generate agreement`);
  console.log(`    GET  /api/legal/summary             - Legal summary`);
  console.log(`\n✅ TRUST SYSTEM (4):`);
  console.log(`    GET  /api/trust/badges              - Get security badges`);
  console.log(`    GET  /api/trust/certifications      - Get certifications`);
  console.log(`    GET  /api/trust/html-badges         - HTML badge code`);
  console.log(`    GET  /api/trust/score               - Trust score`);
  console.log(`\n🛡️  PROTECTION SYSTEM (7):`);
  console.log(`    GET  /api/protection/plans          - Protection plans`);
  console.log(`    GET  /api/protection/plans/:plan    - Plan details`);
  console.log(`    POST /api/protection/add            - Add protection`);
  console.log(`    POST /api/protection/claim          - File claim`);
  console.log(`    GET  /api/protection/claim/:id      - Claim status`);
  console.log(`    GET  /api/protection/guarantees     - All guarantees`);
  console.log(`    POST /api/protection/info           - Protection info`);
  console.log(`\n⭐ LOYALTY PROGRAM (6):`);
  console.log(`    POST /api/loyalty/member            - Create/get loyalty member`);
  console.log(`    GET  /api/loyalty/details/:userId   - Get member details`);
  console.log(`    POST /api/loyalty/booking           - Record booking & points`);
  console.log(`    GET  /api/loyalty/tiers             - Get all tiers`);
  console.log(`    POST /api/loyalty/redeem            - Redeem points`);
  console.log(`    GET  /api/loyalty/leaderboard       - Loyalty leaderboard`);
  console.log(`\n🔗 REFERRAL SYSTEM (5):`);
  console.log(`    POST /api/referral/generate         - Generate referral code`);
  console.log(`    POST /api/referral/link             - Create referral link`);
  console.log(`    POST /api/referral/convert          - Convert referral`);
  console.log(`    GET  /api/referral/stats/:userId    - Referral stats`);
  console.log(`    GET  /api/referral/top              - Top referrers`);
  console.log(`\n💳 PAYMENT PLANS (5):`);
  console.log(`    GET  /api/payment-plans/available   - Available plans`);
  console.log(`    POST /api/payment-plans/agreement   - Create agreement`);
  console.log(`    POST /api/payment-plans/payment     - Process payment`);
  console.log(`    GET  /api/payment-plans/agreement   - Agreement details`);
  console.log(`    GET  /api/payment-plans/user        - User agreements`);
  console.log(`\n🎯 ACTIVITIES SYSTEM (8):`);
  console.log(`    GET  /api/activities/search         - Search activities`);
  console.log(`    GET  /api/activities/:id            - Activity details`);
  console.log(`    POST /api/activities/book           - Book activity`);
  console.log(`    POST /api/activities/favorites      - Add to favorites`);
  console.log(`    GET  /api/activities/favorites      - Get favorites`);
  console.log(`    POST /api/activities/review         - Leave review`);
  console.log(`    GET  /api/activities/recommendations - Get recommendations`);
  console.log(`    GET  /api/activities/popular        - Popular activities`);
  console.log(`\n📧 EMAIL MARKETING (5):`);
  console.log(`    POST /api/email/subscribe           - Subscribe to emails`);
  console.log(`    POST /api/email/send-triggered      - Send triggered email`);
  console.log(`    POST /api/email/campaign            - Create campaign`);
  console.log(`    GET  /api/email/templates           - Get templates`);
  console.log(`    GET  /api/email/stats               - Email stats`);
  console.log(`\n📊 ANALYTICS SYSTEM (7):`);
  console.log(`    GET  /api/analytics/dashboard       - Analytics dashboard`);
  console.log(`    POST /api/analytics/track-view      - Track page view`);
  console.log(`    POST /api/analytics/track-activity  - Track activity`);
  console.log(`    GET  /api/analytics/funnel          - Funnel analysis`);
  console.log(`    GET  /api/analytics/cohort          - Cohort analysis`);
  console.log(`    GET  /api/analytics/devices         - Device analytics`);
  console.log(`    GET  /api/analytics/trends          - Analytics trends`);
  console.log(`\n🚀 NEW TOP 10 SYSTEMS (60+ ENDPOINTS):`);
  console.log(`    📱 Mobile App (7), 🌍 Languages (4), 🤖 AI Advisor (4)`);
  console.log(`    ⭐ Reviews (5), 💎 Subscriptions (5), 💰 Global Payments (4)`);
  console.log(`    🏥 Insurance (4), 🔔 Notifications (4), 🎯 Personalization (4)`);
  console.log(`    🔍 Search (4), 🏢 White-Label (6)`);
  console.log(`${divider}\n`);
});

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('[✓] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[✓] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[✓] SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('[✓] Server closed');
    process.exit(0);
  });
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('[✗] Uncaught Exception:', err.message);
  console.error('    Stack:', err.stack);
  process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('[✗] Unhandled Rejection at:', promise);
  console.error('    Reason:', reason);
});

module.exports = app;
