const pickupService = require('../services/pickupService');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/v1/pickups:
 *   post:
 *     summary: Create a new pickup request
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dump_site_id
 *               - pickup_location_address
 *               - pickup_latitude
 *               - pickup_longitude
 *               - waste_type
 *               - waste_quantity_kg
 *             properties:
 *               dump_site_id:
 *                 type: string
 *                 format: uuid
 *               pickup_location_address:
 *                 type: string
 *               pickup_latitude:
 *                 type: number
 *               pickup_longitude:
 *                 type: number
 *               waste_type:
 *                 type: string
 *               waste_quantity_kg:
 *                 type: number
 *               estimated_pickup_time:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               special_instructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pickup request created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Dump site not found
 */
const createPickup = asyncHandler(async (req, res) => {
  const pickupData = req.body;
  const requesterId = req.user.id;
  
  const pickup = await pickupService.createPickup(pickupData, requesterId);
  
  res.status(201).json({
    success: true,
    message: 'Pickup request created successfully',
    data: { pickup }
  });
});

/**
 * @swagger
 * /api/v1/pickups:
 *   get:
 *     summary: Get pickup requests with filters
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, assigned, in_progress, completed, cancelled, verified]
 *       - in: query
 *         name: requester_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: assigned_picker_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: waste_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Pickup requests retrieved successfully
 */
const getPickups = asyncHandler(async (req, res) => {
  const filters = req.query;
  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sort_by: req.query.sort_by || 'created_at',
    sort_order: req.query.sort_order || 'desc'
  };
  
  const result = await pickupService.getPickups(filters, pagination);
  
  res.json({
    success: true,
    data: result
  });
});

/**
 * @swagger
 * /api/v1/pickups/{id}:
 *   get:
 *     summary: Get pickup request by ID
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pickup request retrieved successfully
 *       404:
 *         description: Pickup request not found
 */
const getPickupById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const pickup = await pickupService.getPickupById(id);
  
  res.json({
    success: true,
    data: { pickup }
  });
});

/**
 * @swagger
 * /api/v1/pickups/{id}:
 *   put:
 *     summary: Update pickup request
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigned_picker_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [pending, assigned, in_progress, completed, cancelled, verified]
 *               actual_pickup_time:
 *                 type: string
 *                 format: date-time
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       200:
 *         description: Pickup request updated successfully
 *       400:
 *         description: Validation error or invalid status transition
 *       404:
 *         description: Pickup request not found
 */
const updatePickup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const userId = req.user.id;
  
  const pickup = await pickupService.updatePickup(id, updateData, userId);
  
  res.json({
    success: true,
    message: 'Pickup request updated successfully',
    data: { pickup }
  });
});

/**
 * @swagger
 * /api/v1/pickups/{id}:
 *   delete:
 *     summary: Delete pickup request
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pickup request deleted successfully
 *       404:
 *         description: Pickup request not found
 */
const deletePickup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const result = await pickupService.deletePickup(id, userId);
  
  res.json({
    success: true,
    message: result.message
  });
});

/**
 * @swagger
 * /api/v1/pickups/nearby:
 *   get:
 *     summary: Get nearby pickup requests
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius_km
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Nearby pickup requests retrieved successfully
 */
const getNearbyPickups = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius_km = 10, limit = 20 } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required',
      code: 'MISSING_COORDINATES'
    });
  }
  
  const pickups = await pickupService.getNearbyPickups(
    parseFloat(latitude),
    parseFloat(longitude),
    parseFloat(radius_km),
    parseInt(limit)
  );
  
  res.json({
    success: true,
    data: { pickups }
  });
});

/**
 * @swagger
 * /api/v1/pickups/stats:
 *   get:
 *     summary: Get pickup statistics
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pickup statistics retrieved successfully
 */
const getPickupStats = asyncHandler(async (req, res) => {
  const stats = await pickupService.getPickupStats();
  
  res.json({
    success: true,
    data: { stats }
  });
});

/**
 * @swagger
 * /api/v1/pickups/{id}/assign:
 *   post:
 *     summary: Assign pickup to a picker
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - picker_id
 *             properties:
 *               picker_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Pickup assigned successfully
 *       400:
 *         description: Invalid picker or pickup status
 *       404:
 *         description: Pickup or picker not found
 */
const assignPickup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { picker_id } = req.body;
  const userId = req.user.id;
  
  const pickup = await pickupService.updatePickup(id, {
    assigned_picker_id: picker_id,
    status: 'assigned'
  }, userId);
  
  res.json({
    success: true,
    message: 'Pickup assigned successfully',
    data: { pickup }
  });
});

/**
 * @swagger
 * /api/v1/pickups/{id}/start:
 *   post:
 *     summary: Start pickup process
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pickup started successfully
 *       400:
 *         description: Invalid pickup status or not assigned to user
 */
const startPickup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  // Verify the pickup is assigned to the current user
  const pickup = await pickupService.getPickupById(id);
  if (pickup.assigned_picker_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only start pickups assigned to you',
      code: 'NOT_ASSIGNED'
    });
  }
  
  const updatedPickup = await pickupService.updatePickup(id, {
    status: 'in_progress',
    actual_pickup_time: new Date().toISOString()
  }, userId);
  
  res.json({
    success: true,
    message: 'Pickup started successfully',
    data: { pickup: updatedPickup }
  });
});

/**
 * @swagger
 * /api/v1/pickups/{id}/complete:
 *   post:
 *     summary: Complete pickup process
 *     tags: [Pickups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       200:
 *         description: Pickup completed successfully
 *       400:
 *         description: Invalid pickup status or not assigned to user
 */
const completePickup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { photos } = req.body;
  const userId = req.user.id;
  
  // Verify the pickup is assigned to the current user
  const pickup = await pickupService.getPickupById(id);
  if (pickup.assigned_picker_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only complete pickups assigned to you',
      code: 'NOT_ASSIGNED'
    });
  }
  
  const updatedPickup = await pickupService.updatePickup(id, {
    status: 'completed',
    photos: photos || []
  }, userId);
  
  res.json({
    success: true,
    message: 'Pickup completed successfully',
    data: { pickup: updatedPickup }
  });
});

module.exports = {
  createPickup,
  getPickups,
  getPickupById,
  updatePickup,
  deletePickup,
  getNearbyPickups,
  getPickupStats,
  assignPickup,
  startPickup,
  completePickup
}; 