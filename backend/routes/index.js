const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const pickupRoutes = require('./pickups');
const userRoutes = require('./users');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GCMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Garbage Collection Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      pickups: '/api/pickups',
      health: '/api/health'
    },
    documentation: '/api-docs'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/pickups', pickupRoutes);

module.exports = router; 