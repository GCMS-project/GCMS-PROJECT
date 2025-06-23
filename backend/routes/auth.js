const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/auth');
const { 
  userRegistrationSchema, 
  userLoginSchema, 
  userUpdateSchema 
} = require('../utils/validation');

// Public routes
router.post('/register', validateBody(userRegistrationSchema), authController.register);
router.post('/login', validateBody(userLoginSchema), authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateBody(userUpdateSchema), authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/refresh', authenticateToken, authController.refreshToken);

module.exports = router; 