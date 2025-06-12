# RedAlert API Documentation

## Overview

RedAlert is a comprehensive news reporting platform API built with NestJS, featuring authentication, reporter management, article publishing, location hierarchy, and payment processing.

## Base URLs

- **Development**: `http://localhost:3004`
- **Staging**: `https://app.hrcitodaynews.in`

## Interactive Documentation

- **Swagger UI**: `http://localhost:3004/api/docs`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication (`/api/auth`)

#### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john.doe@example.com"
}
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "9876543210",
  "mpin": "123456"
}
```

#### Request OTP

```bash
POST /api/auth/request-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

#### Set MPIN

```bash
POST /api/auth/set-mpin
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456",
  "mpin": "654321"
}
```

#### Check MPIN Status

```bash
POST /api/auth/check-mpin
Content-Type: application/json

{
  "phone": "9876543210"
}
```

### 👥 Reporters (`/api/reporters`)

_All endpoints require authentication_

#### Get All Reporters

```bash
GET /api/reporters
Authorization: Bearer {{token}}
```

#### Create Reporter Profile

```bash
POST /api/reporters
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Reporter Name",
  "phone": "9876543210",
  "email": "reporter@example.com",
  "level": "REPORTER",
  "countryId": 1,
  "stateId": 1,
  "districtId": 1,
  "constituencyId": 1,
  "mandalId": 1
}
```

#### Get Reporter by ID

```bash
GET /api/reporters/:id
Authorization: Bearer {{token}}
```

#### Get Reporter ID Card

```bash
GET /api/reporters/:id/idcard
Authorization: Bearer {{token}}
```

#### Generate KYC OTP

```bash
POST /api/reporters/:id/kyc/generate-otp
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id_number": "123456789012"
}
```

**Request Body:**

- `id_number` (string, required): 12-digit Aadhaar number for KYC verification

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP generated successfully",
  "data": {
    "client_id": "client_12345_abcdef",
    "message": "OTP sent to registered mobile number"
  }
}
```

#### Verify KYC OTP

```bash
POST /api/reporters/:id/kyc/verify-otp
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "client_id": "client_12345_abcdef",
  "otp": "123456"
}
```

**Request Body:**

- `client_id` (string, required): Client ID received from generate OTP response
- `otp` (string, required): 6-digit OTP received for Aadhaar verification

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "KYC verification completed successfully",
  "data": {
    "verified": true,
    "name": "John Doe",
    "aadhaar_number": "XXXX-XXXX-9012",
    "verification_date": "2024-01-01T00:00:00Z"
  }
}
```

### 📰 Articles (`/api/articles`)

#### Create Article

```bash
POST /api/articles
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Breaking News: Important Update",
  "content": "This is the detailed content of the news article...",
  "languageCode": "en",
  "metaDescription": "Important news update about recent developments",
  "metaTitle": "Breaking News Update",
  "keywords": ["politics", "breaking", "local"],
  "countryId": 1,
  "stateId": 1,
  "districtId": 1,
  "constituencyId": 1,
  "mandalId": 1,
  "imageUrl": "https://example.com/image.jpg",
  "isBreaking": false
}
```

#### Get All Articles (Public)

```bash
GET /api/articles?language=en&state=telangana
```

#### Update Article Status

```bash
PUT /api/articles/:id/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "isLive": true
}
```

#### Add Article Comment

```bash
POST /api/articles/:id/comments
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "content": "Great article!"
}
```

### 💳 Payments (`/payments/razorpay`)

#### Create Subscription (Authenticated)

```bash
POST /payments/razorpay/subscription
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "amount": 50000,
  "period": 1,
  "notes": "Monthly subscription for reporter"
}
```

#### Create Guest Subscription

```bash
POST /payments/razorpay/guest-subscription
Content-Type: application/json

{
  "phone": "9888888888",
  "name": "Guest User",
  "amount": 50000,
  "period": 1
}
```

#### Check Subscription Status

```bash
POST /payments/razorpay/check-subscription-status
Content-Type: application/json

{
  "phone": "9876543210"
}
```

#### Get Subscription Details

```bash
GET /payments/razorpay/subscription/:id
Authorization: Bearer {{token}}
```

#### Cancel Subscription

```bash
POST /payments/razorpay/subscription/:id/cancel
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "cancelAtCycleEnd": true
}
```

#### Verify Payment

```bash
POST /payments/razorpay/verify-payment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_subscription_id": "sub_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

### 🌍 Locations (`/api/locations`)

_All endpoints require authentication_

#### Countries

```bash
# Get all countries
GET /api/locations/countries

# Create country (Admin/Desk only)
POST /api/locations/countries
{
  "name": "India",
  "code": "IN"
}

# Get country by ID
GET /api/locations/countries/:id

# Update country (Admin/Desk only)
PATCH /api/locations/countries/:id

# Delete country (Admin only)
DELETE /api/locations/countries/:id
```

#### States

```bash
# Get all states (optionally filter by country)
GET /api/locations/states?countryId=1

# Get states by country
GET /api/locations/countries/:countryId/states

# Create state (Admin/Desk only)
POST /api/locations/states
{
  "name": "Telangana",
  "code": "TS",
  "countryId": 1
}
```

#### Districts

```bash
# Get all districts (optionally filter by state)
GET /api/locations/districts?stateId=1

# Get districts by state
GET /api/locations/states/:stateId/districts

# Create district (Admin/Desk only)
POST /api/locations/districts
{
  "name": "Hyderabad",
  "stateId": 1
}
```

#### Constituencies

```bash
# Get all constituencies (optionally filter by district)
GET /api/locations/constituencies?districtId=1

# Get constituencies by district
GET /api/locations/districts/:districtId/constituencies

# Create constituency (Admin/Desk only)
POST /api/locations/constituencies
{
  "name": "Secunderabad",
  "districtId": 1
}
```

#### Mandals

```bash
# Get all mandals (optionally filter by constituency)
GET /api/locations/mandals?constituencyId=1

# Get mandals by constituency
GET /api/locations/constituencies/:constituencyId/mandals

# Create mandal (Admin/Desk only)
POST /api/locations/mandals
{
  "name": "Begumpet",
  "constituencyId": 1
}
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

## Error Responses

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "data": {}
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Environment Variables Required

```env
DATABASE_URL="postgresql://username:password@localhost:5432/redalert"
JWT_SECRET="your-jwt-secret"
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
```

## Testing with cURL Templates

### Variables for easy testing:

```bash
export LOCAL="http://localhost:3004"
export STAGING="https://app.hrcitodaynews.in"
export TOKEN="your-jwt-token-here"
```

### Quick Test Commands:

```bash
# Test registration
curl -X POST $LOCAL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "phone": "9999999999", "email": "test@example.com"}'

# Test guest subscription
curl -X POST $LOCAL/payments/razorpay/guest-subscription \
  -H "Content-Type: application/json" \
  -d '{"phone": "9888888888", "name": "Guest User", "amount": 50000, "period": 1}'

# Test subscription status
curl -X POST $LOCAL/payments/razorpay/check-subscription-status \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```
