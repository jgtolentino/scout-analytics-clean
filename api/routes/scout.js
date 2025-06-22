const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const scoutController = require('../controllers/scoutController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Scout Analytics
 *   description: Unified Scout Analytics endpoints for comprehensive data access
 */

// All Scout Analytics routes require authentication
router.use(authenticateToken);

// Scout Analytics endpoints
router.get('/analytics', scoutController.getAnalytics);
router.get('/health', scoutController.healthCheck);

module.exports = router;