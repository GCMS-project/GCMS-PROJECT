const express = require('express');
const router = express.Router();
const { GPSLocation, User, Route } = require('../models');
const { requireRole } = require('../middlewares/auth');

// Root GPS endpoint - return GPS service status
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'GPS Service is running',
      endpoints: {
        update: 'POST /api/gps/update - Update GPS location',
        current: 'GET /api/gps/current - Get current location',
        history: 'GET /api/gps/history - Get location history',
        route: 'GET /api/gps/route/:routeId - Get route tracking',
        nearby: 'GET /api/gps/nearby-providers - Get nearby service providers'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GPS root endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'GPS service error'
    });
  }
});

// Update GPS location
router.post('/update', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      altitude,
      accuracy,
      speed,
      heading,
      locationType,
      address,
      routeId,
      tripId,
      batteryLevel,
      signalStrength
    } = req.body;

    // Validate GPS coordinates
    if (!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates'
      });
    }

    // Create GPS location record
    const gpsLocation = await GPSLocation.create({
      entityId: req.user.id,
      entityType: req.user.role === 'DRIVER' ? 'DRIVER' : 'USER',
      latitude,
      longitude,
      altitude,
      accuracy,
      speed,
      heading,
      timestamp: new Date(),
      locationType: locationType || 'IN_TRANSIT',
      address,
      routeId,
      tripId,
      batteryLevel,
      signalStrength,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'GPS location updated successfully',
      data: gpsLocation
    });
  } catch (error) {
    console.error('Error updating GPS location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update GPS location'
    });
  }
});

// Get current location
router.get('/current', async (req, res) => {
  try {
    const location = await GPSLocation.findOne({
      where: {
        entityId: req.user.id,
        isActive: true
      },
      order: [['timestamp', 'DESC']]
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location data found'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Error fetching current location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current location'
    });
  }
});

// Get location history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate, locationType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      entityId: req.user.id
    };

    if (startDate && endDate) {
      whereClause.timestamp = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (locationType) {
      whereClause.locationType = locationType;
    }

    const locations = await GPSLocation.findAndCountAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        locations: locations.rows,
        total: locations.count,
        page: parseInt(page),
        totalPages: Math.ceil(locations.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location history'
    });
  }
});

// Get route tracking
router.get('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user has access to this route
    const route = await Route.findOne({
      where: {
        id: routeId,
        [sequelize.Op.or]: [
          { driverId: req.user.id },
          { createdBy: req.user.id }
        ]
      }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found or access denied'
      });
    }

    const whereClause = {
      routeId
    };

    if (startDate && endDate) {
      whereClause.timestamp = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const locations = await GPSLocation.findAll({
      where: whereClause,
      order: [['timestamp', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        route,
        locations,
        totalPoints: locations.length
      }
    });
  } catch (error) {
    console.error('Error fetching route tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route tracking'
    });
  }
});

// Get nearby service providers
router.get('/nearby-providers', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Get recent locations of service providers
    const recentLocations = await GPSLocation.findAll({
      where: {
        entityType: 'DRIVER',
        isActive: true,
        timestamp: {
          [sequelize.Op.gte]: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
        }
      },
      include: [
        { model: User, as: 'entity', attributes: ['id', 'name', 'email', 'phoneNumber'] }
      ],
      order: [['timestamp', 'DESC']]
    });

    // Filter by distance
    const nearbyProviders = recentLocations.filter(location => {
      const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
      return distance <= radius;
    });

    res.json({
      success: true,
      data: {
        providers: nearbyProviders,
        total: nearbyProviders.length,
        radius: parseInt(radius)
      }
    });
  } catch (error) {
    console.error('Error fetching nearby providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby providers'
    });
  }
});

// Admin: Get all active locations
router.get('/admin/active', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const { entityType, locationType } = req.query;

    const whereClause = {
      isActive: true,
      timestamp: {
        [sequelize.Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      }
    };

    if (entityType) whereClause.entityType = entityType;
    if (locationType) whereClause.locationType = locationType;

    const locations = await GPSLocation.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'entity', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['timestamp', 'DESC']]
    });

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching active locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active locations'
    });
  }
});

// Admin: Get location statistics
router.get('/admin/stats', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.timestamp = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const stats = await GPSLocation.findAll({
      where: whereClause,
      attributes: [
        'entityType',
        'locationType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('speed')), 'avgSpeed'],
        [sequelize.fn('MAX', sequelize.col('speed')), 'maxSpeed']
      ],
      group: ['entityType', 'locationType']
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching location statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location statistics'
    });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

module.exports = router; 