# GCMS Mobile Application APIs

This document lists all API endpoints required for the mobile app (drivers, verifiers, service providers).

---

## Authentication

### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": { ... }
}
```

---

## Driver/Provider Flows

### Get Assigned Pickups
- **GET** `/api/pickups/assigned`
- **Auth:** Bearer Token (driver/provider)
- **Response:**
```json
{
  "success": true,
  "pickups": [ ... ]
}
```

### Update Pickup Status
- **PUT** `/api/pickups/:id/status`
- **Auth:** Bearer Token (driver/provider)
- **Body:**
```json
{
  "status": "pending|in_progress|completed|cancelled"
}
```
- **Response:**
```json
{
  "success": true,
  "pickup": { ... }
}
```

### Submit GPS Location
- **POST** `/api/gps`
- **Auth:** Bearer Token (driver)
- **Body:**
```json
{
  "latitude": -6.7924,
  "longitude": 39.2083,
  "timestamp": "ISODate"
}
```
- **Response:**
```json
{
  "success": true,
  "location": { ... }
}
```

### Get Route for Pickup
- **GET** `/api/routes/:pickupId`
- **Auth:** Bearer Token (driver)
- **Response:**
```json
{
  "success": true,
  "route": { ... }
}
```

---

## Verifier Flows

### Get Pickups to Verify
- **GET** `/api/pickups/to-verify`
- **Auth:** Bearer Token (verifier)
- **Response:**
```json
{
  "success": true,
  "pickups": [ ... ]
}
```

### Submit Verification
- **POST** `/api/pickups/:id/verify`
- **Auth:** Bearer Token (verifier)
- **Body:**
```json
{
  "verified": true,
  "notes": "string"
}
```
- **Response:**
```json
{
  "success": true,
  "verification": { ... }
}
```

---

## Notifications

### Get Notifications
- **GET** `/api/notifications`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "notifications": [ ... ]
}
```

---

## Payments

### Get Payment History
- **GET** `/api/payments`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "payments": [ ... ]
}
```

### Make Payment
- **POST** `/api/payments`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "amount": 10000,
  "method": "mpesa|card|cash",
  "reference": "string"
}
```
- **Response:**
```json
{
  "success": true,
  "payment": { ... }
}
```

---

## Error Handling
- All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

---

**Contact the backend team for any additional endpoints or custom requirements.** 