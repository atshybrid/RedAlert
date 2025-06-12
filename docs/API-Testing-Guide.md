# RedAlert API Testing Guide

## 🚀 Quick Access

**Swagger UI**: [http://localhost:3004/api/docs](http://localhost:3004/api/docs)

## 📋 Complete Testing Flow

### Step 1: User Registration & Authentication

#### 1.1 Register New User
```bash
POST /api/auth/register
{
  "name": "Test User",
  "phone": "9876543210",
  "email": "test@example.com"
}
```

#### 1.2 Request OTP
```bash
POST /api/auth/request-otp
{
  "phone": "9876543210"
}
```

#### 1.3 Set MPIN (Account Activation)
```bash
POST /api/auth/set-mpin
{
  "phone": "9876543210",
  "otp": "123456",
  "mpin": "654321"
}
```

#### 1.4 Login & Get JWT Token
```bash
POST /api/auth/login
{
  "phone": "9876543210",
  "mpin": "654321"
}
```
**Save the JWT token from response for authenticated requests!**

#### 1.5 Check MPIN Status
```bash
POST /api/auth/check-mpin
{
  "phone": "9876543210"
}
```

### Step 2: Reporter Profile Management

#### 2.1 Create Reporter Profile
```bash
POST /api/reporters
Authorization: Bearer <your-jwt-token>
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "level": "REPORTER",
  "countryId": 1,
  "stateId": 1,
  "districtId": 1,
  "constituencyId": 1,
  "mandalId": 1
}
```

#### 2.2 Get All Reporters
```bash
GET /api/reporters
Authorization: Bearer <your-jwt-token>
```

#### 2.3 Get Reporter by ID
```bash
GET /api/reporters/1
Authorization: Bearer <your-jwt-token>
```

#### 2.4 Generate Reporter ID Card
```bash
GET /api/reporters/1/idcard
Authorization: Bearer <your-jwt-token>
```

#### 2.5 KYC Verification - Generate OTP
```bash
POST /api/reporters/1/kyc/generate-otp
Authorization: Bearer <your-jwt-token>
{
  "id_number": "123456789012"
}
```

#### 2.6 KYC Verification - Verify OTP
```bash
POST /api/reporters/1/kyc/verify-otp
Authorization: Bearer <your-jwt-token>
{
  "client_id": "client_12345_abcdef",
  "otp": "123456"
}
```

### Step 3: Article Management

#### 3.1 Create Article
```bash
POST /api/articles
Authorization: Bearer <your-jwt-token>
{
  "title": "Breaking News: Important Update",
  "content": "This is the detailed content of the news article...",
  "languageCode": "en",
  "metaDescription": "Important news update",
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

#### 3.2 Get All Articles (Public)
```bash
GET /api/articles?language=en&state=telangana
```

#### 3.3 Update Article Status
```bash
PUT /api/articles/1/status
Authorization: Bearer <your-jwt-token>
{
  "isLive": true
}
```

#### 3.4 Add Comment to Article
```bash
POST /api/articles/1/comments
Authorization: Bearer <your-jwt-token>
{
  "content": "Great article! Very informative."
}
```

### Step 4: Payment & Subscription

#### 4.1 Create Guest Subscription
```bash
POST /payments/razorpay/guest-subscription
{
  "phone": "9888888888",
  "name": "Guest User",
  "amount": 50000,
  "period": 1
}
```

#### 4.2 Create Authenticated Subscription
```bash
POST /payments/razorpay/subscription
Authorization: Bearer <your-jwt-token>
{
  "amount": 50000,
  "period": 1,
  "notes": "Monthly subscription for reporter"
}
```

#### 4.3 Check Subscription Status
```bash
POST /payments/razorpay/check-subscription-status
{
  "phone": "9876543210"
}
```

#### 4.4 Get Subscription Details
```bash
GET /payments/razorpay/subscription/sub_xxxxx
Authorization: Bearer <your-jwt-token>
```

#### 4.5 Cancel Subscription
```bash
POST /payments/razorpay/subscription/sub_xxxxx/cancel
Authorization: Bearer <your-jwt-token>
{
  "cancelAtCycleEnd": true
}
```

#### 4.6 Verify Payment
```bash
POST /payments/razorpay/verify-payment
Authorization: Bearer <your-jwt-token>
{
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_subscription_id": "sub_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

### Step 5: Location Management

#### 5.1 Get All Countries
```bash
GET /api/locations/countries
Authorization: Bearer <your-jwt-token>
```

#### 5.2 Get All States
```bash
GET /api/locations/states
Authorization: Bearer <your-jwt-token>
```

#### 5.3 Get States by Country
```bash
GET /api/locations/countries/1/states
Authorization: Bearer <your-jwt-token>
```

#### 5.4 Get Districts by State
```bash
GET /api/locations/states/1/districts
Authorization: Bearer <your-jwt-token>
```

#### 5.5 Get Constituencies by District
```bash
GET /api/locations/districts/1/constituencies
Authorization: Bearer <your-jwt-token>
```

#### 5.6 Get Mandals by Constituency
```bash
GET /api/locations/constituencies/1/mandals
Authorization: Bearer <your-jwt-token>
```

## 🔧 Testing Tips

### Using Swagger UI
1. **Open**: [http://localhost:3004/api/docs](http://localhost:3004/api/docs)
2. **Authorize**: Click "Authorize" button and enter JWT token
3. **Test**: Click "Try it out" on any endpoint
4. **Examples**: All endpoints have pre-filled examples

### Test Data
- **Phone Numbers**: Use 10-digit Indian format (9876543210)
- **Location IDs**: Country: 1, State: 1 (seeded data)
- **Amounts**: In paise (50000 = ₹500)
- **OTP**: Use "123456" for testing
- **MPIN**: 4-6 digit PIN

### Authentication Flow
1. Register → Request OTP → Set MPIN → Login → Get Token
2. Use token for all protected endpoints
3. Token format: `Bearer <jwt-token>`

### Common Test Scenarios
1. **New User Journey**: Register → Activate → Login → Create Profile → Publish Article
2. **Guest Subscription**: Direct payment without registration
3. **KYC Verification**: Complete reporter verification process
4. **Content Management**: Create → Publish → Comment workflow

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "data": {}
}
```

## 🎯 Testing Checklist

- [ ] User registration and authentication flow
- [ ] Reporter profile creation and management
- [ ] KYC verification process
- [ ] Article creation and publishing
- [ ] Payment and subscription flows
- [ ] Location hierarchy navigation
- [ ] Error handling and validation
- [ ] JWT token authentication
- [ ] Public vs protected endpoints

## 🔗 Additional Resources

- **Postman Collection**: [https://documenter.getpostman.com/view/19692468/2sB2x5HYBq](https://documenter.getpostman.com/view/19692468/2sB2x5HYBq)
- **API Documentation**: [docs/API-Documentation.md](./API-Documentation.md)
- **Swagger UI**: [http://localhost:3004/api/docs](http://localhost:3004/api/docs)
