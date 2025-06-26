const express = require('express');
const router = express.Router();
const { Tender, User, SpecialArea } = require('../models');
const { generateTenderId, formatTenderForResponse, validateTenderData } = require('../utils/tenderUtils');
const notificationService = require('../services/notificationService');
const { requireRole } = require('../middlewares/auth');

// Get all tenders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, tenderType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (tenderType) whereClause.tenderType = tenderType;

    const tenders = await Tender.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'awardedToUser', attributes: ['id', 'name', 'email'] },
        { model: SpecialArea, as: 'specialArea', attributes: ['id', 'name', 'category'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedTenders = tenders.rows.map(tender => formatTenderForResponse(tender));

    res.json({
      success: true,
      data: {
        tenders: formattedTenders,
        total: tenders.count,
        page: parseInt(page),
        totalPages: Math.ceil(tenders.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenders'
    });
  }
});

// Get tender by ID
router.get('/:id', async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'awardedToUser', attributes: ['id', 'name', 'email'] },
        { model: SpecialArea, as: 'specialArea', attributes: ['id', 'name', 'category'] }
      ]
    });

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found'
      });
    }

    res.json({
      success: true,
      data: formatTenderForResponse(tender)
    });
  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tender'
    });
  }
});

// Create tender (manual creation)
router.post('/', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const tenderData = req.body;
    
    // Validate tender data
    const validationErrors = validateTenderData(tenderData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const tenderId = generateTenderId();
    const tender = await Tender.create({
      ...tenderData,
      tenderId,
      createdBy: req.user.id,
      isAutomated: false,
      triggerType: 'MANUAL'
    });

    // Send notifications to service providers
    await notificationService.sendNotificationToRole('SERVICE_PROVIDER', {
      type: 'TENDER_CREATION',
      title: 'New Tender Available',
      message: `A new tender has been created: ${tender.title}`,
      channels: ['email', 'sms', 'dashboard'],
      metadata: {
        tenderId: tender.tenderId,
        volume: tender.volumeRequired,
        vehicleType: tender.vehicleType
      }
    });

    res.status(201).json({
      success: true,
      message: 'Tender created successfully',
      data: formatTenderForResponse(tender)
    });
  } catch (error) {
    console.error('Error creating tender:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tender'
    });
  }
});

// Update tender
router.put('/:id', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id);
    
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found'
      });
    }

    // Check if tender can be updated
    if (tender.status === 'AWARDED' || tender.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update awarded or completed tender'
      });
    }

    await tender.update(req.body);

    res.json({
      success: true,
      message: 'Tender updated successfully',
      data: formatTenderForResponse(tender)
    });
  } catch (error) {
    console.error('Error updating tender:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tender'
    });
  }
});

// Award tender to service provider
router.post('/:id/award', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const { serviceProviderId, awardAmount, notes } = req.body;
    
    const tender = await Tender.findByPk(req.params.id);
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found'
      });
    }

    if (tender.status !== 'PUBLISHED') {
      return res.status(400).json({
        success: false,
        message: 'Tender is not in published status'
      });
    }

    // Verify service provider exists
    const serviceProvider = await User.findByPk(serviceProviderId);
    if (!serviceProvider || serviceProvider.role !== 'SERVICE_PROVIDER') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service provider'
      });
    }

    await tender.update({
      status: 'AWARDED',
      awardedTo: serviceProviderId,
      awardAmount,
      awardNotes: notes,
      awardedAt: new Date(),
      awardedBy: req.user.id
    });

    // Send notification to awarded service provider
    await notificationService.sendNotification({
      type: 'TENDER_AWARD',
      recipientId: serviceProviderId,
      recipientType: 'SERVICE_PROVIDER',
      title: 'Tender Awarded',
      message: `Congratulations! Your bid has been accepted for tender: ${tender.title}`,
      channels: ['email', 'sms', 'whatsapp', 'dashboard'],
      metadata: {
        tenderId: tender.tenderId,
        awardAmount,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Tender awarded successfully',
      data: formatTenderForResponse(tender)
    });
  } catch (error) {
    console.error('Error awarding tender:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award tender'
    });
  }
});

// Cancel tender
router.post('/:id/cancel', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR']), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const tender = await Tender.findByPk(req.params.id);
    if (!tender) {
      return res.status(404).json({
        success: false,
        message: 'Tender not found'
      });
    }

    if (tender.status === 'AWARDED' || tender.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel awarded or completed tender'
      });
    }

    await tender.update({
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledAt: new Date(),
      cancelledBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Tender cancelled successfully',
      data: formatTenderForResponse(tender)
    });
  } catch (error) {
    console.error('Error cancelling tender:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel tender'
    });
  }
});

// Get tenders by service provider
router.get('/service-provider/:providerId', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { awardedTo: req.params.providerId };
    if (status) whereClause.status = status;

    const tenders = await Tender.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: SpecialArea, as: 'specialArea', attributes: ['id', 'name', 'category'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedTenders = tenders.rows.map(tender => formatTenderForResponse(tender));

    res.json({
      success: true,
      data: {
        tenders: formattedTenders,
        total: tenders.count,
        page: parseInt(page),
        totalPages: Math.ceil(tenders.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching service provider tenders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenders'
    });
  }
});

// Get tender statistics
router.get('/stats/overview', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const stats = await Tender.findAll({
      attributes: [
        'status',
        'tenderType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('volumeRequired')), 'totalVolume'],
        [sequelize.fn('SUM', sequelize.col('estimatedBudget')), 'totalBudget']
      ],
      group: ['status', 'tenderType']
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching tender statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tender statistics'
    });
  }
});

module.exports = router; 