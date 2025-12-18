# LEGAL CONTRACTS & TERMS GUIDE

## Overview

The Legal System provides transparent, customer-friendly legal documents that build trust and ensure compliance. All documents are professional, GDPR-compliant, and clearly explain customer rights and responsibilities.

## Key Features

✅ **3 Complete Legal Documents**
- Terms of Service (10 comprehensive sections)
- Cancellation Policy (4 transparent refund tiers)
- Privacy Policy (GDPR compliant, security-focused)

✅ **Customer Agreement Generator**
- Personalized agreements per customer
- Automatic signature tracking
- Legal document audit trail

✅ **Transparency & Trust**
- Plain English, customer-friendly language
- Clear refund guarantees
- Honest cancellation policies
- Data privacy protection

✅ **Legal Compliance**
- GDPR ready
- Data protection standards
- Consumer protection laws
- Industry best practices

## API Endpoints

### 1. Get All Legal Documents
**Endpoint:** `GET /api/legal/documents`

Returns all three legal documents in full detail.

**Response:**
```json
{
  "success": true,
  "documents": {
    "terms_of_service": {
      "title": "TERMS OF SERVICE",
      "sections": 10,
      "content": "..."
    },
    "cancellation_policy": {
      "title": "CANCELLATION & REFUND POLICY",
      "sections": 4,
      "content": "..."
    },
    "privacy_policy": {
      "title": "PRIVACY POLICY",
      "sections": 10,
      "content": "..."
    }
  }
}
```

### 2. Get Specific Legal Document
**Endpoint:** `GET /api/legal/documents/:docType`

Returns a specific legal document.

**Document Types:**
- `terms` - Terms of Service
- `privacy` - Privacy Policy  
- `cancellation` - Cancellation & Refund Policy

**Example:** `GET /api/legal/documents/terms`

**Response:**
```json
{
  "success": true,
  "document": {
    "title": "TERMS OF SERVICE",
    "lastUpdated": "2025-12-18",
    "sections": [
      {
        "number": 1,
        "title": "Booking Rights & Limitations",
        "content": "..."
      },
      {
        "number": 2,
        "title": "Payment Terms",
        "content": "..."
      }
    ]
  }
}
```

### 3. Generate Customer Agreement
**Endpoint:** `POST /api/legal/agreement`

Creates a personalized customer agreement for a specific booking.

**Request:**
```json
{
  "customerId": "CUST-123",
  "customerName": "John Doe",
  "email": "john@example.com",
  "bookingDetails": {
    "bookingId": "BOOK-456",
    "destination": "Paris",
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-20",
    "amount": 1200
  }
}
```

**Response:**
```json
{
  "success": true,
  "agreementId": "AGRE-ABC123",
  "customerId": "CUST-123",
  "agreementContent": "MYEAGLE TRAVEL BOOKING AGREEMENT\n\nThis agreement is between MyEagle and John Doe...",
  "printableUrl": "/pdf/agreement/AGRE-ABC123.pdf",
  "signatureRequired": true,
  "createdAt": "2025-12-18T12:00:00Z",
  "expiresAt": "2025-12-25T12:00:00Z"
}
```

### 4. Get Legal Documents Summary
**Endpoint:** `GET /api/legal/summary`

Returns a quick summary of all legal documents.

**Response:**
```json
{
  "success": true,
  "summary": {
    "headline": "Your booking is legally protected",
    "documentsCount": 3,
    "totalSections": 24,
    "keyGuarantees": [
      "100% Safe Booking",
      "Best Price Guaranteed",
      "24/7 Support",
      "Money-Back Guarantee",
      "Booking Protection",
      "Refund Guarantee"
    ],
    "highlights": {
      "termsOfService": "10 sections covering all your rights",
      "cancellationPolicy": "Fair 4-tier refund system",
      "privacyPolicy": "Your data is 256-bit encrypted & GDPR protected"
    }
  }
}
```

## Complete Legal Documents

### 1. TERMS OF SERVICE (10 Sections)

**Section 1: Booking Rights & Limitations**
- What MyEagle provides
- What customers are responsible for
- Booking age requirements
- Valid ID requirements

**Section 2: Payment Terms**
- Accepted payment methods
- Payment timing
- Currency conversion
- No hidden fees policy

**Section 3: Cancellation & Refunds**
- 7+ days: 100% refund
- 3-7 days: 50% refund
- <48 hours: No refund
- Medical/emergency exceptions

**Section 4: Booking Modifications**
- Free changes (within policies)
- Date changes (availability dependent)
- Airline upgrade rules
- Hotel room changes

**Section 5: Prices & Availability**
- Price guarantee until checkout
- Last-minute deals
- Price drops after booking
- Inventory accuracy

**Section 6: Liability & Responsibilities**
- What MyEagle is responsible for
- What airlines/hotels are responsible for
- Force majeure clause
- Incident reporting

**Section 7: Customer Conduct**
- Appropriate use of service
- No discrimination
- No fraudulent activity
- Consequences for violations

**Section 8: Dispute Resolution**
- Contact support first
- Escalation process
- 30-day resolution timeline
- Customer satisfaction priority

**Section 9: SMS & Communication**
- SMS opt-in/out
- Email frequency
- Contact preferences
- Data usage

**Section 10: Changes to Terms**
- How we update policies
- 30-day notice requirement
- Continued use = acceptance
- Archived versions available

### 2. CANCELLATION & REFUND POLICY (4 Tiers)

**Tier 1: 7+ Days Before Travel (100% Refund)**
- Full refund of all charges
- No penalties
- Money back in 5-10 business days
- Instant confirmation

**Tier 2: 3-7 Days Before Travel (50% Refund)**
- 50% refund of booking amount
- Service fee retained
- Processing in 5-10 days
- Rebook within 1 year for 50% credit

**Tier 3: < 48 Hours Before Travel (No Refund)**
- No refund possible
- Can rebook for different dates
- Full credit toward future booking
- Contact support for exceptions

**Tier 4: Emergency & Medical (Special Consideration)**
- Medical emergencies: 100% refund
- Family emergency: Case-by-case
- Natural disaster: Full credit
- Requires documentation

### 3. PRIVACY POLICY (GDPR Compliant, 10 Sections)

**Section 1: Data We Collect**
- Name, email, phone
- Passport information (for booking only)
- Payment information (processed securely)
- Travel preferences
- Communication history

**Section 2: How We Use Your Data**
- Process your booking
- Send confirmations & updates (SMS + email)
- Improve our service
- Prevent fraud
- Legal compliance

**Section 3: Data Security (256-bit SSL)**
- Industry-standard encryption
- Secure data centers
- Regular security audits
- No data breaches (ever)
- PCI DSS Level 1 certified

**Section 4: Data Retention**
- Booking data: 7 years (legal requirement)
- Payment info: 90 days max
- Preferences: Until you delete
- Communication: 2 years
- Easy deletion available

**Section 5: Third-Party Sharing (NO SHARING)**
- We DO NOT sell your data
- Airlines/hotels only get booking essentials
- Payment processor (PCI compliant)
- Legal authorities (only if required)
- Transparency guaranteed

**Section 6: Your Rights (GDPR)**
- Right to access your data
- Right to delete your data
- Right to correct your data
- Right to data portability
- Easy opt-out anytime

**Section 7: Cookies & Tracking**
- Essential cookies only
- No tracking cookies
- No third-party tracking
- Cookie management available

**Section 8: SMS & Email Communication**
- Opt-in SMS for updates
- Unsubscribe anytime
- One-click opt-out
- We respect your preferences

**Section 9: International Data Transfer**
- EU-US Privacy Shield compliant
- Standard contractual clauses
- Equivalent protection
- You have control

**Section 10: Policy Updates**
- 30-day notice of changes
- Continued use = acceptance
- View previous versions
- Contact us with questions

## Integration Example

```javascript
// Get legal documents when customer views booking
fetch('/api/legal/documents')
  .then(r => r.json())
  .then(data => {
    // Display Terms of Service
    document.getElementById('terms').textContent = 
      data.documents.terms_of_service.content;
    
    // Display Privacy Policy
    document.getElementById('privacy').textContent = 
      data.documents.privacy_policy.content;
  });

// Generate agreement when booking is confirmed
fetch('/api/legal/agreement', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: 'CUST-123',
    customerName: 'John Doe',
    email: 'john@example.com',
    bookingDetails: {
      bookingId: 'BOOK-456',
      destination: 'Paris',
      amount: 1200
    }
  })
})
.then(r => r.json())
.then(data => {
  // Send agreement to customer
  sendEmailWithAgreement(data.agreementId, data.agreementContent);
  
  // Store agreement ID for record
  storeAgreementId(data.agreementId);
});
```

## Customer Experience

**When customer books:**
1. Sees Terms of Service in booking flow
2. Checks "I agree to terms" checkbox
3. Views Privacy Policy option
4. Sees Cancellation Policy with refund amounts
5. Receives email with full agreement PDF
6. Can access anytime in "My Account > Agreements"

**Legal Assurance Message:**
```
Your booking is legally protected with:
✓ Clear Terms of Service
✓ Fair Cancellation Policy
✓ GDPR-Compliant Privacy Policy
✓ 100% Money-Back Guarantee
✓ No Hidden Fees
✓ Transparent Pricing
```

## Compliance Checklist

✅ **GDPR Compliance**
- Explicit consent required
- Easy data access/deletion
- Right to be forgotten
- Privacy by default

✅ **Consumer Protection**
- Clear refund terms
- No misleading claims
- Transparent pricing
- Dispute resolution

✅ **Data Protection**
- 256-bit SSL encryption
- Secure data centers
- Regular audits
- PCI DSS Level 1

✅ **Accessibility**
- Plain English (not legal jargon)
- Mobile-friendly format
- Print-friendly option
- Available in multiple languages

## Support

For legal questions:
- Review the specific document
- Check FAQ section
- Contact legal@myeagle.com
- Live chat support available

---

**Module Location:** `base44-actions/legal-terms.js`
**Endpoints:** 4 (documents, specific doc, agreement, summary)
**Documents:** 3 complete legal documents
**Sections:** 24 comprehensive sections
**Compliance:** GDPR-ready, consumer protection
