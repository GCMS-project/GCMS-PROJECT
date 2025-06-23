# GCMS Backend API

A comprehensive Node.js/Express backend API for the Garbage Collection Management System (GCMS).

## 🚀 Features

- **JWT Authentication** - Secure login with email/phone and password
- **Role-Based Access Control** - Admin, Customer, Picker, Dumpsite Officer, Tender Officer roles
- **Pickup Management** - Complete pickup lifecycle from request to completion
- **Dump Verification** - Multi-level verification workflow
- **Input Validation** - Zod schema validation for all endpoints
- **Error Handling** - Centralized error handling with detailed logging
- **API Documentation** - OpenAPI 3.0 specification with Swagger UI
- **Database Integration** - PostgreSQL with connection pooling
- **Security** - Helmet, CORS, rate limiting, input sanitization

## 📋 Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- Docker (optional, for containerized setup)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gcms-v2
   DB_USER=postgres
   DB_PASSWORD=Link@babe32

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_for_gcms_system_2024
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d

   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Logging
   LOG_LEVEL=info
   LOG_FILE=./logs/app.log
   ```

4. **Database Setup**
   Ensure PostgreSQL is running and the database schema is created:
   ```bash
   # Test database connection
   node test-db.js
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

Once the server is running, access the API documentation at:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow:
1. **Register** a new user account
2. **Login** with email/phone and password
3. **Use the returned token** in the Authorization header: `Bearer <token>`

### Default Admin Account:
- **Email**: admin@gcms.com
- **Password**: admin123

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication endpoints
│   └── pickupController.js  # Pickup management endpoints
├── middlewares/
│   ├── auth.js             # JWT authentication middleware
│   ├── errorHandler.js     # Centralized error handling
│   └── validation.js       # Input validation middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── pickups.js          # Pickup routes
│   └── index.js            # Main routes index
├── services/
│   ├── userService.js      # User business logic
│   └── pickupService.js    # Pickup business logic
├── utils/
│   ├── auth.js             # JWT utilities
│   ├── logger.js           # Winston logger configuration
│   └── validation.js       # Zod validation schemas
├── logs/                   # Application logs
├── server.js               # Main application file
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Pickups
- `POST /api/v1/pickups` - Create pickup request
- `GET /api/v1/pickups` - Get pickup requests (with filters)
- `GET /api/v1/pickups/:id` - Get pickup by ID
- `PUT /api/v1/pickups/:id` - Update pickup
- `DELETE /api/v1/pickups/:id` - Delete pickup
- `GET /api/v1/pickups/nearby` - Get nearby pickups
- `GET /api/v1/pickups/stats` - Get pickup statistics
- `POST /api/v1/pickups/:id/assign` - Assign pickup to picker
- `POST /api/v1/pickups/:id/start` - Start pickup process
- `POST /api/v1/pickups/:id/complete` - Complete pickup

### System
- `GET /api/v1/health` - Health check
- `GET /api/v1/` - API information

## 🔒 Role-Based Access Control

### User Roles:
- **admin** - Full system access
- **customer** - Create/view own pickups, make payments
- **picker** - View assigned pickups, update status
- **dumpsite_officer** - Verify dumps, manage dump sites
- **tender_officer** - Manage tenders and bids

### Permission Matrix:
| Endpoint | Admin | Customer | Picker | Dumpsite Officer | Tender Officer |
|----------|-------|----------|--------|------------------|----------------|
| Create Pickup | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Pickups | ✅ | Own only | Assigned only | ✅ | ✅ |
| Assign Pickup | ✅ | ❌ | ❌ | ❌ | ✅ |
| Start Pickup | ✅ | ❌ | ✅ | ❌ | ❌ |
| Complete Pickup | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Stats | ✅ | ❌ | ❌ | ❌ | ✅ |

## 📊 Database Schema

The API works with the following main tables:
- **users** - User accounts and profiles
- **pickup_requests** - Garbage pickup requests
- **dump_verifications** - Multi-level verification records
- **dump_sites** - Waste disposal locations
- **tenders** - Bidding system for pickups
- **bids** - Individual bids on tenders
- **payments** - Payment transactions
- **notifications** - System notifications
- **audit_logs** - Activity audit trail

## 🧪 Testing

### Manual Testing with Postman:
1. Import the `GCMS_API_Postman_Collection.json` file
2. Set the `baseUrl` variable to `http://localhost:3000/api/v1`
3. Run the "Login User" request to get a token
4. The token will be automatically set for subsequent requests

### API Testing Flow:
1. **Register** a new customer account
2. **Login** to get JWT token
3. **Create** a pickup request
4. **View** pickup details
5. **Update** pickup status (if authorized)
6. **Complete** pickup workflow

## 🔧 Development

### Available Scripts:
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
npm run docs       # Generate API documentation
```

### Adding New Endpoints:
1. Create controller in `controllers/`
2. Add validation schema in `utils/validation.js`
3. Create route in `routes/`
4. Add middleware for authentication/authorization
5. Update API documentation with Swagger comments

### Logging:
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Console output in development mode

## 🚀 Deployment

### Docker Deployment:
```bash
# Build image
docker build -t gcms-backend .

# Run container
docker run -p 3000:3000 --env-file .env gcms-backend
```

### Environment Variables for Production:
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🔍 Monitoring

### Health Check:
- Endpoint: `GET /api/health`
- Returns server status, environment, and version

### Logging:
- Winston logger with file and console output
- Structured logging with timestamps
- Error tracking with stack traces

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper validation and error handling
3. Include API documentation with Swagger comments
4. Test all endpoints before submitting
5. Follow the established naming conventions

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the logs in the `logs/` directory
- Test database connectivity with `node test-db.js` 