# SMS NOTIFICATIONS SYSTEM GUIDE

## Overview

The SMS Notifications System sends real-time text messages to customer phones for booking confirmations, payment updates, and travel alerts. This keeps customers informed and reassured that their booking is safe and being processed.

## Key Features

✅ **10 Professional SMS Templates**
- Booking confirmation notifications
- Payment received confirmations
- Flight details notifications
- Hotel confirmation messages
- Payment failure alerts
- Booking reminder messages
- Cancellation options notification
- 24/7 support availability alerts
- Refund initiation notifications
- Security assurance messages

✅ **Real-Time Delivery**
- Instant SMS sending
- Phone number validation
- Automatic logging
- Delivery tracking

✅ **Customer Confidence**
- "100% SAFE" security messages
- 24/7 support information
- Refund guarantees in messages
- Professional, friendly tone

## API Endpoints

### 1. Send SMS Notification
**Endpoint:** `POST /api/sms/send`

Sends SMS to customer phone with booking information.

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "smsType": "booking_confirmed",
  "bookingData": {
    "bookingId": "BOOK-123",
    "bookingAmount": 650,
    "destination": "Paris",
    "checkIn": "2025-01-15"
  }
}
```

**Available SMS Types:**
- `booking_confirmed` - Booking confirmation
- `payment_received` - Payment processed
- `flight_confirmation` - Flight details
- `hotel_confirmation` - Hotel booking details
- `payment_failed` - Payment error alert
- `booking_reminder` - Trip reminder
- `cancellation_available` - Cancellation option alert
- `support_available` - 24/7 support info
- `refund_initiated` - Refund notification
- `security_alert` - Security assurance

**Response:**
```json
{
  "success": true,
  "messageId": "SMS-1234567890",
  "phoneNumber": "+1234567890",
  "smsType": "booking_confirmed",
  "message": "MyEagle: Your booking is CONFIRMED! Ref: BOOK-123...",
  "status": "queued_for_delivery"
}
```

### 2. Send Security Assurance SMS
**Endpoint:** `POST /api/sms/send-security`

Sends a specific security/safety assurance message to customer.

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "SMS-SEC-1234",
  "message": "MyEagle Security: Your booking with John Doe is 100% PROTECTED...",
  "assurances": [
    "24/7 customer support",
    "Money-back guarantee",
    "Fraud protection",
    "Secure SSL connection"
  ]
}
```

### 3. Get SMS Log for Phone Number
**Endpoint:** `GET /api/sms/log/:phoneNumber`

Retrieves all SMS messages sent to a specific phone number.

**Response:**
```json
{
  "success": true,
  "phoneNumber": "+1234567890",
  "totalMessages": 5,
  "messages": [
    {
      "messageId": "SMS-1234567890",
      "type": "booking_confirmed",
      "message": "MyEagle: Your booking is CONFIRMED...",
      "sentAt": "2025-12-18T12:00:00Z",
      "status": "delivered"
    }
  ]
}
```

### 4. Get SMS Statistics
**Endpoint:** `GET /api/sms/statistics`

Gets overall SMS system statistics.

**Response:**
```json
{
  "success": true,
  "templatesCount": 10,
  "totalMessagesSent": 1250,
  "deliveryRate": "98.5%",
  "mostUsedTemplate": "booking_confirmed",
  "averageDeliveryTime": "3 seconds"
}
```

## Integration Example

```javascript
// Send booking confirmation SMS
fetch('/api/sms/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    smsType: 'booking_confirmed',
    bookingData: {
      bookingId: 'BOOK-456',
      bookingAmount: 1200,
      destination: 'Tokyo',
      checkIn: '2025-02-01'
    }
  })
})
.then(r => r.json())
.then(data => console.log('SMS sent:', data.messageId));
```

## SMS Templates Details

### Booking Confirmed
- Message: "Your booking CONFIRMED! Reference: {bookingId}. Total: ${amount}. Support: 24/7. 100% SAFE."
- Includes: Booking reference, amount, support info

### Payment Received
- Message: "Payment received and secured! Booking: {bookingId}. Amount: ${amount}. Your money is safe."
- Includes: Confirmation, security assurance

### Flight Confirmation
- Message: "Flight confirmed! {flightNumber} {origin}→{destination}. {departDate}. Details: MyEagle App"
- Includes: Flight details, easy access to app

### Hotel Confirmation
- Message: "{hotelName} {checkIn}→{checkOut} for {guests} guests. Reference: {bookingId}. Confirmation sent."
- Includes: Hotel details, dates, reference

### Payment Failed
- Message: "Payment failed for booking {bookingId}. Please update payment. Support: 24/7"
- Includes: Action required, support contact

### Booking Reminder
- Message: "Trip reminder! {destination} {checkIn} in 3 days. Download MyEagle App for docs."
- Includes: Trip countdown, easy access

### Cancellation Available
- Message: "Change of plans? Free cancellation until {deadline}. No questions asked. Full refund."
- Includes: Cancellation deadline, refund guarantee

### Support Available
- Message: "24/7 Support available! Live chat, email, or phone. Booking: {bookingId}. We're here!"
- Includes: Support channels, booking reference

### Refund Initiated
- Message: "Refund initiated! Amount: ${amount}. Processing 5-10 days. Thank you!"
- Includes: Amount, timeline, gratitude

### Security Alert
- Message: "Security: Your booking is 100% PROTECTED. SSL encrypted. Fraud protected. Your data is safe."
- Includes: Security features, data protection

## Configuring Real Twilio SMS

To send real SMS instead of console logging:

1. **Get Twilio Account:**
   - Sign up at www.twilio.com
   - Get your Account SID and Auth Token
   - Get a phone number (e.g., +1234567890)

2. **Add Environment Variables:**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Update sms-notifications.js:**
   - Uncomment Twilio code
   - Comment out console.log fallback
   - Install twilio: `npm install twilio`

4. **Test Real SMS:**
   - Send test SMS to verify delivery
   - Monitor Twilio console for delivery reports

## Customer Experience

**What customers receive:**

```
myeagle.com/sms

Your booking is CONFIRMED!
Reference: BOOK-ABC123
Destination: Paris, France
Check-in: January 15, 2025
Total: $650.00
Support: 24/7 available
100% SAFE - Money-back guarantee
Download app: [link]
```

## Best Practices

✅ **Always Include:**
- Booking reference
- Amount
- Date/destination
- Support contact info
- "100% SAFE" or guarantee mention

✅ **Keep Messages:**
- Short and clear
- One key message per SMS
- Mobile-friendly
- Easy to understand

✅ **Timing:**
- Immediate: Booking confirmation
- Same day: Payment confirmation
- 2 hours: Flight/hotel details
- 7 days before: Trip reminder
- 15+ days before: Cancellation option alert

## Support

For SMS issues:
- Check phone number format (must include +1 country code)
- Verify Twilio credentials if using real SMS
- Check SMS log for delivery status
- Contact Twilio support for delivery failures

---

**Module Location:** `base44-actions/sms-notifications.js`
**Endpoints:** 4 (send, send-security, log, statistics)
**Templates:** 10 professional SMS types
