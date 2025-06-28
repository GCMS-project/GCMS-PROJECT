# GCMS Web Application APIs

This document lists all API endpoints required for the web frontend.

---

## Authentication

### Register
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user|admin|supervisor|provider|driver|verifier",
  "phone": "string"
}
```
- **Response:**
```json
{
  "success": true,
  "user": { ... },
  "message": "User registered successfully"
}
```

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

## User Management

### Get Current User
- **GET** `/api/users/me`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### Get All Users (Admin)
- **GET** `/api/users`
- **Auth:** Bearer Token (admin)
- **Response:**
```json
{
  "success": true,
  "users": [ ... ]
}
```

### Update User
- **PUT** `/api/users/:id`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "username": "string",
  "email": "string",
  "role": "string",
  "phone": "string"
}
```
- **Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## Tenders

### Get All Tenders
- **GET** `/api/tenders`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "tenders": [ ... ]
}
```

### Create Tender (Supervisor/Admin)
- **POST** `/api/tenders`
- **Auth:** Bearer Token (supervisor/admin)
- **Body:**
```json
{
  "title": "string",
  "description": "string",
  "budget": 10000,
  "deadline": "ISODate",
  "location": "string",
  "requirements": ["string"]
}
```
- **Response:**
```json
{
  "success": true,
  "tender": { ... }
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

### Mark Notification as Read
- **PUT** `/api/notifications/:id/read`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "notification": { ... }
}
```

---

## Payments

### Get Payments
- **GET** `/api/payments`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "payments": [ ... ]
}
```

### Create Payment
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

## GPS Tracking

### Get GPS Locations
- **GET** `/api/gps`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "locations": [ ... ]
}
```

---

## Routes

### Get Routes
- **GET** `/api/routes`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "routes": [ ... ]
}
```

---

## Special Areas

### Get Special Areas
- **GET** `/api/special-areas`
- **Auth:** Bearer Token
- **Response:**
```json
{
  "success": true,
  "areas": [ ... ]
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