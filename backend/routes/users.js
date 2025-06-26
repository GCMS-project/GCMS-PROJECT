const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole, requireOwnership } = require('../middlewares/auth');
const { validateParams } = require('../middlewares/validation');
const { uuidSchema } = require('../utils/validation');

// Apply authentication to all routes
router.use(authenticateToken);

// User registration (admin only)
router.post('/register', requireRole(['admin']), userController.registerUser);

// Get all users (admin only)
router.get('/', requireRole(['admin']), userController.getAllUsers);

// Get user statistics (admin only)
router.get('/stats', requireRole(['admin']), userController.getStats);

// Get roles and permissions (admin only)
router.get('/roles', requireRole(['admin']), userController.getRoles);

// Get user by ID (admin or own profile)
router.get('/:id', 
  validateParams({ id: uuidSchema }), 
  requireOwnership('id'), 
  userController.getUserById
);

// Update user (admin or own profile)
router.put('/:id', 
  validateParams({ id: uuidSchema }), 
  requireOwnership('id'), 
  userController.updateUser
);

// Delete user (admin only)
router.delete('/:id', 
  validateParams({ id: uuidSchema }), 
  requireRole(['admin']), 
  userController.deleteUser
);

module.exports = router; 