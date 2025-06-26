const express = require('express');
const router = express.Router();
const { Route, User, Tender, GPSLocation } = require('../models');
const { generateRouteId, calculateDistance } = require('../utils/tenderUtils');
const { requireRole } = require('../middlewares/auth');

// Get all routes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, routeType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (routeType) whereClause.routeType = routeType;

    // Filter by user role
    if (req.user.role === 'DRIVER') {
      whereClause.driverId = req.user.id;
    } else if (req.user.role === 'SERVICE_PROVIDER') {
      // Get routes assigned to drivers under this service provider
      const drivers = await User.findAll({
        where: { 
          serviceProviderId: req.user.id,
          role: 'DRIVER'
        },
        attributes: ['id']
      });
      whereClause.driverId = {
        [sequelize.Op.in]: drivers.map(d => d.id)
      };
    }

    const routes = await Route.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'driver', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assigner', attributes: ['id', 'name', 'email'] },
        { model: Tender, as: 'tender', attributes: ['id', 'tenderId', 'title'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        routes: routes.rows,
        total: routes.count,
        page: parseInt(page),
        totalPages: Math.ceil(routes.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch routes'
    });
  }
});

// Get route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id, {
      include: [
        { model: User, as: 'driver', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assigner', attributes: ['id', 'name', 'email'] },
        { model: Tender, as: 'tender', attributes: ['id', 'tenderId', 'title'] },
        { model: GPSLocation, as: 'gpsLocations', order: [['timestamp', 'ASC']] }
      ]
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'DRIVER' && route.driverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route'
    });
  }
});

// Create route
router.post('/', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const {
      name,
      description,
      routeType,
      driverId,
      vehicleId,
      tenderId,
      startLocation,
      endLocation,
      waypoints,
      pickupPoints,
      dumpSite,
      totalDistance,
      estimatedDuration,
      totalVolume,
      smallSacks,
      largeSacks
    } = req.body;

    // Validate required fields
    if (!name || !routeType || !startLocation || !endLocation) {
      return res.status(400).json({
        success: false,
        message: 'Name, route type, start location, and end location are required'
      });
    }

    // Validate GPS coordinates
    if (!validateGPS(startLocation) || !validateGPS(endLocation)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates'
      });
    }

    const routeId = generateRouteId();
    const route = await Route.create({
      routeId,
      name,
      description,
      routeType,
      driverId,
      vehicleId,
      tenderId,
      startLocation,
      endLocation,
      waypoints: waypoints || [],
      pickupPoints: pickupPoints || [],
      dumpSite,
      totalDistance: totalDistance || calculateRouteDistance(startLocation, endLocation, waypoints),
      estimatedDuration: estimatedDuration || 120, // Default 2 hours
      totalVolume: totalVolume || 0,
      smallSacks: smallSacks || 0,
      largeSacks: largeSacks || 0,
      status: 'PLANNED',
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create route'
    });
  }
});

// Update route
router.put('/:id', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if route can be updated
    if (route.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed route'
      });
    }

    await route.update(req.body);

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update route'
    });
  }
});

// Assign route to driver
router.post('/:id/assign', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const { driverId } = req.body;
    
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    if (route.status !== 'PLANNED') {
      return res.status(400).json({
        success: false,
        message: 'Route is not in planned status'
      });
    }

    // Verify driver exists and is available
    const driver = await User.findByPk(driverId);
    if (!driver || driver.role !== 'DRIVER') {
      return res.status(400).json({
        success: false,
        message: 'Invalid driver'
      });
    }

    await route.update({
      driverId,
      assignedBy: req.user.id,
      status: 'ASSIGNED'
    });

    res.json({
      success: true,
      message: 'Route assigned successfully',
      data: route
    });
  } catch (error) {
    console.error('Error assigning route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign route'
    });
  }
});

// Start route
router.post('/:id/start', async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if user is the assigned driver
    if (req.user.role === 'DRIVER' && route.driverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (route.status !== 'ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: 'Route is not assigned'
      });
    }

    await route.update({
      status: 'IN_PROGRESS',
      actualStartTime: new Date()
    });

    res.json({
      success: true,
      message: 'Route started successfully',
      data: route
    });
  } catch (error) {
    console.error('Error starting route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start route'
    });
  }
});

// Complete route
router.post('/:id/complete', async (req, res) => {
  try {
    const { actualDuration, fuelConsumption } = req.body;
    
    const route = await Route.findByPk(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if user is the assigned driver
    if (req.user.role === 'DRIVER' && route.driverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (route.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Route is not in progress'
      });
    }

    await route.update({
      status: 'COMPLETED',
      actualEndTime: new Date(),
      actualDuration,
      fuelConsumption
    });

    res.json({
      success: true,
      message: 'Route completed successfully',
      data: route
    });
  } catch (error) {
    console.error('Error completing route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete route'
    });
  }
});

// Optimize route
router.post('/:id/optimize', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Simulate route optimization
    const optimizedRoute = await optimizeRoute(route);

    await route.update({
      waypoints: optimizedRoute.waypoints,
      totalDistance: optimizedRoute.totalDistance,
      estimatedDuration: optimizedRoute.estimatedDuration,
      isOptimized: true,
      optimizationAlgorithm: 'NEAREST_NEIGHBOR'
    });

    res.json({
      success: true,
      message: 'Route optimized successfully',
      data: route
    });
  } catch (error) {
    console.error('Error optimizing route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize route'
    });
  }
});

// Get route performance metrics
router.get('/:id/performance', async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id, {
      include: [
        { model: GPSLocation, as: 'gpsLocations', order: [['timestamp', 'ASC']] }
      ]
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const performanceMetrics = calculateRoutePerformance(route);

    res.json({
      success: true,
      data: performanceMetrics
    });
  } catch (error) {
    console.error('Error calculating route performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate route performance'
    });
  }
});

// Get route statistics
router.get('/stats/overview', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const stats = await Route.findAll({
      where: whereClause,
      attributes: [
        'status',
        'routeType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('totalDistance')), 'avgDistance'],
        [sequelize.fn('AVG', sequelize.col('estimatedDuration')), 'avgDuration'],
        [sequelize.fn('SUM', sequelize.col('totalVolume')), 'totalVolume']
      ],
      group: ['status', 'routeType']
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching route statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route statistics'
    });
  }
});

// Helper functions
function validateGPS(location) {
  return location && 
         location.latitude >= -90 && location.latitude <= 90 &&
         location.longitude >= -180 && location.longitude <= 180;
}

function calculateRouteDistance(startLocation, endLocation, waypoints = []) {
  let totalDistance = calculateDistance(
    startLocation.latitude, startLocation.longitude,
    endLocation.latitude, endLocation.longitude
  );

  // Add distance through waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].latitude, waypoints[i].longitude,
      waypoints[i + 1].latitude, waypoints[i + 1].longitude
    );
  }

  return totalDistance;
}

async function optimizeRoute(route) {
  // Simulate route optimization algorithm
  const pickupPoints = route.pickupPoints || [];
  const optimizedWaypoints = [...pickupPoints];
  
  // Simple nearest neighbor algorithm
  optimizedWaypoints.sort((a, b) => {
    const distA = calculateDistance(
      route.startLocation.latitude, route.startLocation.longitude,
      a.latitude, a.longitude
    );
    const distB = calculateDistance(
      route.startLocation.latitude, route.startLocation.longitude,
      b.latitude, b.longitude
    );
    return distA - distB;
  });

  const optimizedDistance = calculateRouteDistance(
    route.startLocation, 
    route.endLocation, 
    optimizedWaypoints
  );

  return {
    waypoints: optimizedWaypoints,
    totalDistance: optimizedDistance,
    estimatedDuration: Math.ceil(optimizedDistance * 2) // 2 minutes per km
  };
}

function calculateRoutePerformance(route) {
  const gpsLocations = route.gpsLocations || [];
  
  if (gpsLocations.length === 0) {
    return {
      actualDistance: 0,
      actualDuration: 0,
      averageSpeed: 0,
      efficiency: 0,
      deviations: []
    };
  }

  let actualDistance = 0;
  let deviations = [];

  // Calculate actual distance from GPS points
  for (let i = 1; i < gpsLocations.length; i++) {
    const prev = gpsLocations[i - 1];
    const curr = gpsLocations[i];
    actualDistance += calculateDistance(
      prev.latitude, prev.longitude,
      curr.latitude, curr.longitude
    );
  }

  const actualDuration = route.actualDuration || 0;
  const averageSpeed = actualDuration > 0 ? (actualDistance / actualDuration) * 60 : 0; // km/h
  const efficiency = route.totalDistance > 0 ? (route.totalDistance / actualDistance) * 100 : 0;

  return {
    actualDistance: Math.round(actualDistance * 100) / 100,
    actualDuration,
    averageSpeed: Math.round(averageSpeed * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    deviations
  };
}

module.exports = router; 