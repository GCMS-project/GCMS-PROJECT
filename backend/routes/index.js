const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const pickupRoutes = require('./pickups');

// Mount routes
router.use('/auth', authRoutes);
router.use('/pickups', pickupRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GCMS API v1.0.0',
    endpoints: {
      auth: '/auth',
      pickups: '/pickups',
      docs: '/api-docs',
      health: '/health'
    },
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 