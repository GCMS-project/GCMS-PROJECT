const express = require('express');
const router = express.Router();
const { SpecialArea, Tender, User } = require('../models');
const { generateSpecialAreaId } = require('../utils/tenderUtils');
const { requireRole } = require('../middlewares/auth');

// Get all special areas
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const areas = await SpecialArea.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'registrar', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        areas: areas.rows,
        total: areas.count,
        page: parseInt(page),
        totalPages: Math.ceil(areas.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching special areas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special areas'
    });
  }
});

// Get special area by ID
router.get('/:id', async (req, res) => {
  try {
    const area = await SpecialArea.findByPk(req.params.id, {
      include: [
        { model: User, as: 'registrar', attributes: ['id', 'name', 'email'] },
        { model: Tender, as: 'tenders', attributes: ['id', 'tenderId', 'title', 'status', 'createdAt'] }
      ]
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Special area not found'
      });
    }

    res.json({
      success: true,
      data: area
    });
  } catch (error) {
    console.error('Error fetching special area:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special area'
    });
  }
});

// Create special area
router.post('/', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const areaData = req.body;
    
    // Validate required fields
    if (!areaData.name || !areaData.category || !areaData.location || !areaData.address) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, location, and address are required'
      });
    }

    // Validate GPS coordinates
    const { latitude, longitude } = areaData.location;
    if (!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates'
      });
    }

    const areaId = generateSpecialAreaId();
    const area = await SpecialArea.create({
      ...areaData,
      areaId,
      registeredBy: req.user.id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Special area created successfully',
      data: area
    });
  } catch (error) {
    console.error('Error creating special area:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create special area'
    });
  }
});

// Update special area
router.put('/:id', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const area = await SpecialArea.findByPk(req.params.id);
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Special area not found'
      });
    }

    await area.update(req.body);

    res.json({
      success: true,
      message: 'Special area updated successfully',
      data: area
    });
  } catch (error) {
    console.error('Error updating special area:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update special area'
    });
  }
});

// Toggle automatic tender generation
router.post('/:id/toggle-automatic-tender', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const area = await SpecialArea.findByPk(req.params.id);
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Special area not found'
      });
    }

    const newStatus = !area.automaticTenderEnabled;
    await area.update({
      automaticTenderEnabled: newStatus
    });

    res.json({
      success: true,
      message: `Automatic tender generation ${newStatus ? 'enabled' : 'disabled'} successfully`,
      data: area
    });
  } catch (error) {
    console.error('Error toggling automatic tender:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle automatic tender generation'
    });
  }
});

// Get special areas by category
router.get('/category/:category', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const areas = await SpecialArea.findAndCountAll({
      where: {
        category: req.params.category,
        isActive: true
      },
      include: [
        { model: User, as: 'registrar', attributes: ['id', 'name', 'email'] }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        areas: areas.rows,
        total: areas.count,
        page: parseInt(page),
        totalPages: Math.ceil(areas.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching special areas by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special areas'
    });
  }
});

// Get special areas near location
router.get('/nearby/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // This is a simplified version - in production you'd use PostGIS or similar
    const areas = await SpecialArea.findAll({
      where: {
        isActive: true
      },
      include: [
        { model: User, as: 'registrar', attributes: ['id', 'name', 'email'] }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Filter by distance (simplified calculation)
    const nearbyAreas = areas.filter(area => {
      const areaLat = area.location.latitude;
      const areaLon = area.location.longitude;
      const distance = calculateDistance(latitude, longitude, areaLat, areaLon);
      return distance <= radius;
    });

    res.json({
      success: true,
      data: {
        areas: nearbyAreas,
        total: nearbyAreas.length,
        page: parseInt(page),
        radius: parseInt(radius)
      }
    });
  } catch (error) {
    console.error('Error fetching nearby special areas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby special areas'
    });
  }
});

// Get special area statistics
router.get('/stats/overview', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const stats = await SpecialArea.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "automaticTenderEnabled" = true THEN 1 ELSE 0 END')), 'automaticTenderEnabled'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN "isActive" = true THEN 1 ELSE 0 END')), 'active']
      ],
      group: ['category']
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching special area statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special area statistics'
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