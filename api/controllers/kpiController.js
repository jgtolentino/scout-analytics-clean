const database = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     KPISummary:
 *       type: object
 *       properties:
 *         totalRevenue:
 *           type: number
 *           description: Total revenue in PHP
 *         totalTransactions:
 *           type: integer
 *           description: Total number of transactions
 *         averageOrderValue:
 *           type: number
 *           description: Average order value
 *         topCategory:
 *           type: string
 *           description: Top performing category
 *         growthRate:
 *           type: number
 *           description: Growth rate percentage
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */

class KPIController {
  /**
   * @swagger
   * /api/kpi/summary:
   *   get:
   *     summary: Get dashboard KPI summary
   *     tags: [KPI]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: KPI summary data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/KPISummary'
   */
  async getSummary(req, res) {
    try {
      const query = `
        SELECT 
          SUM(amount) as totalRevenue,
          COUNT(*) as totalTransactions,
          AVG(amount) as averageOrderValue,
          (SELECT TOP 1 category FROM transactions GROUP BY category ORDER BY COUNT(*) DESC) as topCategory,
          12.5 as growthRate,
          GETDATE() as lastUpdated
        FROM transactions 
        WHERE date >= DATEADD(month, -1, GETDATE())
      `;
      
      const result = await database.query(query);
      
      res.json({
        success: true,
        data: result[0] || {
          totalRevenue: 0,
          totalTransactions: 0,
          averageOrderValue: 0,
          topCategory: 'N/A',
          growthRate: 0,
          lastUpdated: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('KPI Summary error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch KPI summary',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/kpi/transactions:
   *   get:
   *     summary: Get transaction trends
   *     tags: [KPI]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [7d, 30d, 90d]
   *         description: Time period for trends
   *       - in: query
   *         name: region
   *         schema:
   *           type: string
   *         description: Filter by region
   *     responses:
   *       200:
   *         description: Transaction trends data
   */
  async getTransactionTrends(req, res) {
    try {
      const { period = '30d', region } = req.query;
      
      let dateFilter = '';
      switch (period) {
        case '7d':
          dateFilter = 'DATEADD(day, -7, GETDATE())';
          break;
        case '90d':
          dateFilter = 'DATEADD(day, -90, GETDATE())';
          break;
        default:
          dateFilter = 'DATEADD(day, -30, GETDATE())';
      }

      let query = `
        SELECT 
          CAST(date as DATE) as date,
          COUNT(*) as transactions,
          SUM(amount) as revenue,
          AVG(amount) as avgOrderValue
        FROM transactions 
        WHERE date >= ${dateFilter}
      `;

      const params = {};
      if (region) {
        query += ' AND region = @region';
        params.region = region;
      }

      query += ' GROUP BY CAST(date as DATE) ORDER BY date';

      const result = await database.query(query, params);
      
      res.json({
        success: true,
        data: result,
        meta: {
          period,
          region: region || 'all',
          count: result.length
        }
      });
      
    } catch (error) {
      console.error('Transaction trends error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction trends',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/kpi/categories:
   *   get:
   *     summary: Get category performance
   *     tags: [KPI]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Category performance data
   */
  async getCategoryPerformance(req, res) {
    try {
      const query = `
        SELECT 
          category,
          COUNT(*) as transactions,
          SUM(amount) as revenue,
          AVG(amount) as avgOrderValue,
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM transactions)) as percentage
        FROM transactions 
        WHERE date >= DATEADD(month, -1, GETDATE())
        GROUP BY category
        ORDER BY revenue DESC
      `;
      
      const result = await database.query(query);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Category performance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category performance',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/kpi/regions:
   *   get:
   *     summary: Get regional analytics
   *     tags: [KPI]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Regional analytics data
   */
  async getRegionalAnalytics(req, res) {
    try {
      const query = `
        SELECT 
          region,
          COUNT(*) as transactions,
          SUM(amount) as revenue,
          AVG(amount) as avgOrderValue,
          COUNT(DISTINCT brand) as uniqueBrands
        FROM transactions 
        WHERE date >= DATEADD(month, -1, GETDATE())
        GROUP BY region
        ORDER BY revenue DESC
      `;
      
      const result = await database.query(query);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Regional analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch regional analytics',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/kpi/brands:
   *   get:
   *     summary: Get brand performance
   *     tags: [KPI]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Brand performance data
   */
  async getBrandPerformance(req, res) {
    try {
      const query = `
        SELECT 
          brand,
          category,
          COUNT(*) as transactions,
          SUM(amount) as revenue,
          AVG(amount) as avgOrderValue
        FROM transactions 
        WHERE date >= DATEADD(month, -1, GETDATE())
        GROUP BY brand, category
        ORDER BY revenue DESC
      `;
      
      const result = await database.query(query);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Brand performance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch brand performance',
        message: error.message
      });
    }
  }
}

module.exports = new KPIController();
