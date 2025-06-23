const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validation');
const { authenticateToken, requireRole, requireOwnership } = require('../middlewares/auth');
const { 
  pickupRequestSchema, 
  pickupUpdateSchema, 
  pickupQuerySchema,
  uuidSchema 
} = require('../utils/validation');

// All routes require authentication
router.use(authenticateToken);

// Public pickup routes (for authenticated users)
router.post('/', validateBody(pickupRequestSchema), pickupController.createPickup);
router.get('/', validateQuery(pickupQuerySchema), pickupController.getPickups);
router.get('/nearby', pickupController.getNearbyPickups);
router.get('/stats', requireRole(['admin', 'tender_officer']), pickupController.getPickupStats);

// Pickup management routes
router.get('/:id', validateParams({ id: uuidSchema }), pickupController.getPickupById);
router.put('/:id', validateParams({ id: uuidSchema }), validateBody(pickupUpdateSchema), pickupController.updatePickup);
router.delete('/:id', validateParams({ id: uuidSchema }), requireOwnership('requester_id'), pickupController.deletePickup);

// Pickup workflow routes
router.post('/:id/assign', validateParams({ id: uuidSchema }), requireRole(['admin', 'tender_officer']), pickupController.assignPickup);
router.post('/:id/start', validateParams({ id: uuidSchema }), requireRole('picker'), pickupController.startPickup);
router.post('/:id/complete', validateParams({ id: uuidSchema }), requireRole('picker'), pickupController.completePickup);

module.exports = router; 