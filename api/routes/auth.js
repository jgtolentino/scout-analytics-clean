const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// Public routes
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/verify', authenticateToken, authController.verify);
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
