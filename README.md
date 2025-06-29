1# 🗑️ Garbage Collection Management System (GCMS)

A comprehensive, production-ready garbage collection management system built with modern web technologies. This system provides end-to-end management of waste collection operations, from customer requests to final disposal verification.

## 🚀 Features

### 🔐 Authentication & Access Control
- **Multi-role Support**: Admin, Customer, Picker, Dumpsite Officer, Tender Officer
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions per role
- **Session Management**: Automatic token refresh and validation

### 📊 Admin Dashboard
- **Real-time Analytics**: Live statistics and performance metrics
- **Interactive Charts**: Monthly pickup trends and status distribution
- **User Management**: Complete CRUD operations for all user types
- **Pickup Management**: Assign, track, and manage collection requests
- **Dump Site Management**: Monitor capacity and usage
- **Tender Management**: Handle bidding and contract management
- **Payment Overview**: Financial tracking and reporting
- **Audit Logs**: Complete system activity tracking

### 🧾 Role-Specific Features

#### 👨‍💼 Admin
- Full system access and management
- User role assignment and permissions
- System configuration and settings
- Comprehensive reporting and analytics

#### 👤 Customer
- Request pickup services
- Track pickup status and history
- View billing and payment information
- Participate in tender bids (if enabled)

#### 🚛 Picker
- View assigned pickups
- Mark pickups as completed
- Update pickup status in real-time
- Receive notifications for new assignments

#### 🏭 Dumpsite Officer
- Verify completed pickups
- Submit verification with timestamps
- Monitor dump site capacity
- Manage disposal records

#### 📋 Tender Officer
- Manage tender processes
- Handle bid submissions
- Track contract status
- Generate tender reports

### 🌐 Internationalization
- **Multi-language Support**: English and Swahili
- **Language Switcher**: Dynamic language switching
- **Localized Content**: All text and messages translated

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Progressive Web App**: Offline capabilities
- **Touch-Friendly**: Optimized for mobile interactions

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Chart.js** - Interactive data visualization
- **React Hook Form** - Form management
- **React Hot Toast** - User notifications
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Winston** - Logging framework
- **Zod** - Schema validation
- **Swagger** - API documentation

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Docker (optional)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/garbage-collection-system.git
   cd garbage-collection-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../web-app
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   cd backend
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from web-app directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Docker Setup (Alternative)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🗄️ Database Schema

The system uses PostgreSQL with the following main entities:

- **Users**: Authentication and role management
- **PickupRequests**: Collection service requests
- **DumpSites**: Waste disposal locations
- **Tenders**: Bidding and contract management
- **Payments**: Financial transactions
- **AuditLogs**: System activity tracking

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/gcms

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Default Admin Account

After running the seed script, you can login with:
- **Email**: admin@gcms.com
- **Password**: admin123

⚠️ **Important**: Change the default password in production!

## 📚 API Documentation

The API documentation is available at `/api-docs` when the backend server is running. It includes:

- Authentication endpoints
- User management
- Pickup operations
- Dump site management
- Tender operations
- Payment processing
- Audit logging

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd web-app
npm test

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd web-app
npm run build

# Build backend
cd ../backend
npm run build
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure CORS for production domain
5. Set up SSL certificates

### Deployment Options

- **Heroku**: Use the provided Procfile
- **AWS**: Use Docker containers with ECS
- **DigitalOcean**: Deploy with App Platform
- **VPS**: Use PM2 for process management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-org/garbage-collection-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/garbage-collection-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/garbage-collection-system/discussions)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- PostgreSQL for the reliable database
- All contributors and maintainers

---

**Built with ❤️ for better waste management** 