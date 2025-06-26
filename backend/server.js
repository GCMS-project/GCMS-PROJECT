require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const morgan = require('morgan');

// Import middleware and utilities
const { errorHandler, notFound, handleUnhandledRejection, handleUncaughtException } = require('./middlewares/errorHandler');
const { sanitizeInput } = require('./middlewares/validation');
const logger = require('./utils/logger');

// Import database and models
const sequelize = require('./config/database');
const { defineAssociations } = require('./models');

// Import services
const tenderGenerationService = require('./services/tenderGenerationService');
const notificationService = require('./services/notificationService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pickupRoutes = require('./routes/pickups');
const tenderRoutes = require('./routes/tenders');
const specialAreaRoutes = require('./routes/specialAreas');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const gpsRoutes = require('./routes/gps');
const routeRoutes = require('./routes/routes');

// Import middleware
const auth = require('./middlewares/auth');

// Create Express app
const app = express();

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - Allow all origins
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Garbage Collection Management System API',
      version: '1.0.0',
      description: 'API documentation for the GCMS backend system',
      contact: {
        name: 'GCMS Team',
        email: 'support@gcms.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.gcms.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            phone: {
              type: 'string'
            },
            first_name: {
              type: 'string'
            },
            last_name: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['admin', 'customer', 'picker', 'dumpsite_officer', 'tender_officer']
            },
            is_verified: {
              type: 'boolean'
            }
          }
        },
        PickupRequest: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            requester_id: {
              type: 'string',
              format: 'uuid'
            },
            assigned_picker_id: {
              type: 'string',
              format: 'uuid'
            },
            dump_site_id: {
              type: 'string',
              format: 'uuid'
            },
            pickup_location_address: {
              type: 'string'
            },
            waste_type: {
              type: 'string'
            },
            waste_quantity_kg: {
              type: 'number'
            },
            status: {
              type: 'string',
              enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'verified']
            }
          }
        }
      }
    }
  },
  apis: [
    path.join(__dirname, 'controllers/*.js'),
    path.join(__dirname, 'routes/*.js')
  ]
};

const specs = swaggerJsdoc(swaggerOptions);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GCMS API Documentation'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GCMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes, userRoutes);
app.use('/api/pickups', authRoutes, pickupRoutes);
app.use('/api/tenders', authRoutes, tenderRoutes);
app.use('/api/special-areas', authRoutes, specialAreaRoutes);
app.use('/api/notifications', authRoutes, notificationRoutes);
app.use('/api/payments', authRoutes, paymentRoutes);
app.use('/api/gps', authRoutes, gpsRoutes);
app.use('/api/routes', authRoutes, routeRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 GCMS Backend Server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`🔍 Health check available at http://localhost:${PORT}/api/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start automated services
function startAutomatedServices() {
  logger.info('🤖 Starting automated services...');

  // Start tender generation monitoring (every 30 minutes)
  setInterval(async () => {
    try {
      await tenderGenerationService.monitorVolumeThresholds();
    } catch (error) {
      logger.error('Error in tender generation monitoring:', error);
    }
  }, 30 * 60 * 1000); // 30 minutes

  // Start notification processing (every 5 minutes)
  setInterval(async () => {
    try {
      await processPendingNotifications();
    } catch (error) {
      logger.error('Error processing notifications:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  logger.info('✅ Automated services started.');
}

// Process pending notifications
async function processPendingNotifications() {
  try {
    const { Notification } = require('./models');
    
    const pendingNotifications = await Notification.findAll({
      where: {
        status: 'PENDING',
        scheduledFor: {
          [sequelize.Op.lte]: new Date()
        }
      },
      limit: 50
    });

    for (const notification of pendingNotifications) {
      try {
        await notificationService.sendNotification({
          type: notification.type,
          recipientId: notification.recipientId,
          recipientType: notification.recipientType,
          title: notification.title,
          message: notification.message,
          channels: notification.channels,
          metadata: notification.metadata
        });
      } catch (error) {
        logger.error(`Error processing notification ${notification.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in notification processing:', error);
  }
}

module.exports = app; 