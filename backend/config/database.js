const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gcms-v2',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Link@babe32',
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connected to PostgreSQL database successfully.');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database synchronized successfully.');
    }

    return true;
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
}; 