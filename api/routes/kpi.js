const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const kpiController = require('../controllers/kpiController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: KPI
 *   description: Key Performance Indicators endpoints
 */

// All KPI routes require authentication
router.use(authenticateToken);

// KPI endpoints
router.get('/summary', kpiController.getSummary);
router.get('/transactions', kpiController.getTransactionTrends);
router.get('/categories', kpiController.getCategoryPerformance);
router.get('/regions', kpiController.getRegionalAnalytics);
router.get('/brands', kpiController.getBrandPerformance);

module.exports = router;
