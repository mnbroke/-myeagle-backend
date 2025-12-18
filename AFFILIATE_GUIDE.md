# AFFILIATE PROGRAM GUIDE
## Earn Money with MyEagle Travel Booking

---

## 📊 QUICK START

### 1. Register as Affiliate
```bash
POST /api/affiliate/register
Content-Type: application/json

{
  "email": "your.email@example.com",
  "name": "Your Name",
  "website": "yourwebsite.com",
  "bankAccount": "XXXXXXXXXXXXX"
}
```

**Response:**
```json
{
  "success": true,
  "affiliateId": "AFF-1702800000000-abc123def",
  "dashboard": "/api/affiliate/dashboard/AFF-1702800000000-abc123def"
}
```

Save your `affiliateId` - you'll use it for all affiliate operations.

---

## 💰 HOW IT WORKS

### Commission Structure
- **Default Rate:** 5% per booking
- **Flights:** $600 flight × 5% = **$30 commission**
- **Hotels:** $400 hotel × 5% = **$20 commission**
- Payments monthly to your bank account
- Minimum threshold: $100 to process payment

### Example Scenario
```
User clicks your affiliate link
    ↓
Arrives at MyEagle website
    ↓
Books $1000 flight
    ↓
You earn $50 commission
    ↓
Paid to your bank next month
```

---

## 🔗 GENERATING AFFILIATE LINKS

### For Flight Bookings
```bash
POST /api/affiliate/link
Content-Type: application/json

{
  "affiliateId": "AFF-1702800000000-abc123def",
  "productType": "flight",
  "productData": {
    "origin": "NYC",
    "destination": "LAX",
    "date": "2025-12-25",
    "price": 600
  }
}
```

**Response:**
```json
{
  "success": true,
  "affiliateLink": "https://www.skyscanner.com/transport/flights?...",
  "trackingId": "TRK-1702800000000-xyz789",
  "commission": 30,
  "expiresIn": "30 days"
}
```

### For Hotel Bookings
```bash
POST /api/affiliate/link
Content-Type: application/json

{
  "affiliateId": "AFF-1702800000000-abc123def",
  "productType": "hotel",
  "productData": {
    "city": "Paris",
    "checkIn": "2025-12-20",
    "checkOut": "2025-12-25",
    "price": 500
  }
}
```

### Using Affiliate Links
1. **Generate link** with your product details
2. **Share link** on your website, blog, social media
3. **User clicks** and books on MyEagle
4. **You earn** commission automatically

---

## 📈 TRACKING YOUR EARNINGS

### View Your Dashboard
```bash
GET /api/affiliate/dashboard/AFF-1702800000000-abc123def
```

**Dashboard Shows:**
```json
{
  "success": true,
  "affiliate": {
    "id": "AFF-1702800000000-abc123def",
    "name": "Your Name",
    "email": "your.email@example.com",
    "website": "yourwebsite.com",
    "commissionRate": 5
  },
  "stats": {
    "totalClicks": 1250,
    "totalConversions": 45,
    "conversionRate": "3.6%",
    "totalEarnings": 2250,
    "pendingEarnings": 450,
    "approvedEarnings": 1800,
    "paidEarnings": 0
  },
  "recentConversions": [
    {
      "trackingId": "TRK-xxx",
      "affiliateId": "AFF-xxx",
      "bookingId": "BOOK123",
      "amount": 600,
      "productType": "flight",
      "commission": 30,
      "status": "pending",
      "createdAt": "2025-12-16T17:30:00Z"
    }
  ],
  "paymentInfo": {
    "bankAccount": "XXXXXXXXXXXXX",
    "nextPaymentDate": "2026-01-16",
    "minimumPaymentThreshold": 100
  }
}
```

### Earnings Status
- **Pending:** Waiting for approval (usually 3-5 days)
- **Approved:** Ready for payment
- **Paid:** Already transferred to your bank

---

## 🏆 TOP AFFILIATES

### See Who's Earning the Most
```bash
GET /api/affiliate/top
```

**Response:**
```json
{
  "success": true,
  "topAffiliates": [
    {
      "name": "Travel Blog Pro",
      "earnings": 15450,
      "conversions": 258,
      "conversionRate": "4.2%"
    },
    {
      "name": "Budget Travel Tips",
      "earnings": 12300,
      "conversions": 205,
      "conversionRate": "3.8%"
    }
  ]
}
```

---

## 💡 BEST PRACTICES TO EARN MORE

### 1. **Quality Traffic**
- Share links on relevant websites
- Target people interested in travel
- Use clear, compelling descriptions

### 2. **Multiple Products**
- Mix flights and hotels in your recommendations
- Create comparison articles
- Offer bundled deals (flight + hotel)

### 3. **Seasonal Campaigns**
- Holiday bookings (December, Summer)
- Last-minute deals
- Weekend getaway promotions

### 4. **Content Marketing**
- Write travel guides
- Create destination reviews
- Make comparison articles
- Share travel tips

### 5. **Social Media**
- Share on Twitter, Facebook, Instagram
- Use hashtags: #traveldeals #flightdeals
- Partner with travel influencers
- Create shareable content

---

## 📞 SUPPORT

### Common Questions

**Q: When do I get paid?**
- A: Monthly. Once you reach $100, payment processes within 5-10 business days.

**Q: What's my commission rate?**
- A: Default 5%. Higher rates available for top performers. Contact support.

**Q: How do I track conversions?**
- A: Each link has a unique tracking ID. The system auto-tracks clicks and bookings.

**Q: Can I use my links in ads?**
- A: Yes! You can use affiliate links in paid ads, emails, and all marketing channels.

**Q: What if a user doesn't complete the booking?**
- A: Clicks are tracked but you only earn on completed bookings.

**Q: How long are links valid?**
- A: 30 days. Generate new links frequently for best results.

---

## 📋 AFFILIATE TERMS

1. **Honest Promotion:** Don't mislead about products/prices
2. **No Spam:** Don't spam emails or forums
3. **Valid Bookings:** Only genuine bookings count
4. **Bank Details:** Keep banking info current
5. **Payment:** Monthly minimum $100 to process

---

## 🚀 GET STARTED NOW

1. **Register:** Post to `/api/affiliate/register`
2. **Generate Links:** Create affiliate links for products
3. **Share:** Post links on your website/social
4. **Earn:** Get commission on every booking
5. **Track:** Monitor earnings on your dashboard

**Start earning today!** 🎉

---

**Contact:** support@myeagle.com | Phone: +1-800-MYEAGLE
