const database = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     ScoutAnalytics:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             totalRevenue:
 *               type: number
 *             totalTransactions:
 *               type: integer
 *             averageOrderValue:
 *               type: number
 *             topCategory:
 *               type: string
 *             growthRate:
 *               type: number
 *             lastUpdated:
 *               type: string
 *               format: date-time
 *         transactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               transactions:
 *                 type: integer
 *               revenue:
 *                 type: number
 *               avgOrderValue:
 *                 type: number
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               transactions:
 *                 type: integer
 *               revenue:
 *                 type: number
 *               avgOrderValue:
 *                 type: number
 *               percentage:
 *                 type: number
 *         regions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               region:
 *                 type: string
 *               transactions:
 *                 type: integer
 *               revenue:
 *                 type: number
 *               avgOrderValue:
 *                 type: number
 *               uniqueBrands:
 *                 type: integer
 *         brands:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               category:
 *                 type: string
 *               transactions:
 *                 type: integer
 *               revenue:
 *                 type: number
 *               avgOrderValue:
 *                 type: number
 *         meta:
 *           type: object
 *           properties:
 *             generatedAt:
 *               type: string
 *               format: date-time
 *             filters:
 *               type: object
 *             totalDataPoints:
 *               type: integer
 */

class ScoutController {
  /**
   * @swagger
   * /api/scout/analytics:
   *   get:
   *     summary: Get comprehensive Scout Analytics data (singleton endpoint)
   *     description: Returns all Scout Analytics data in a single response including summary, transactions, categories, regions, and brands
   *     tags: [Scout Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: period
   *         schema:
   *           type: string
   *           enum: [7d, 30d, 90d]
   *           default: 30d
   *         description: Time period for analysis
   *       - in: query
   *         name: region
   *         schema:
   *           type: string
   *         description: Filter by specific region
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by specific category
   *       - in: query
   *         name: brand
   *         schema:
   *           type: string
   *         description: Filter by specific brand
   *     responses:
   *       200:
   *         description: Comprehensive Scout Analytics data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ScoutAnalytics'
   *       500:
   *         description: Internal server error
   */
  async getAnalytics(req, res) {
    try {
      const { period = '30d', region, category, brand } = req.query;
      
      // Build date filter based on period
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

      // Build dynamic WHERE clause
      let whereClause = `WHERE date >= ${dateFilter}`;
      const queryParams = {};
      
      if (region) {
        whereClause += ' AND region = @region';
        queryParams.region = region;
      }
      if (category) {
        whereClause += ' AND category = @category';
        queryParams.category = category;
      }
      if (brand) {
        whereClause += ' AND brand = @brand';
        queryParams.brand = brand;
      }

      // Execute all queries in parallel for better performance
      const [
        summaryResult,
        transactionTrendsResult,
        categoryPerformanceResult,
        regionalAnalyticsResult,
        brandPerformanceResult
      ] = await Promise.all([
        // Summary query
        database.query(`
          SELECT 
            SUM(amount) as totalRevenue,
            COUNT(*) as totalTransactions,
            AVG(amount) as averageOrderValue,
            (SELECT TOP 1 category FROM transactions ${whereClause} GROUP BY category ORDER BY COUNT(*) DESC) as topCategory,
            12.5 as growthRate,
            GETDATE() as lastUpdated
          FROM transactions 
          ${whereClause}
        `, queryParams),

        // Transaction trends query
        database.query(`
          SELECT 
            CAST(date as DATE) as date,
            COUNT(*) as transactions,
            SUM(amount) as revenue,
            AVG(amount) as avgOrderValue
          FROM transactions 
          ${whereClause}
          GROUP BY CAST(date as DATE) 
          ORDER BY date
        `, queryParams),

        // Category performance query
        database.query(`
          SELECT 
            category,
            COUNT(*) as transactions,
            SUM(amount) as revenue,
            AVG(amount) as avgOrderValue,
            (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM transactions ${whereClause})) as percentage
          FROM transactions 
          ${whereClause}
          GROUP BY category
          ORDER BY revenue DESC
        `, queryParams),

        // Regional analytics query
        database.query(`
          SELECT 
            region,
            COUNT(*) as transactions,
            SUM(amount) as revenue,
            AVG(amount) as avgOrderValue,
            COUNT(DISTINCT brand) as uniqueBrands
          FROM transactions 
          ${whereClause}
          GROUP BY region
          ORDER BY revenue DESC
        `, queryParams),

        // Brand performance query
        database.query(`
          SELECT TOP 20
            brand,
            category,
            COUNT(*) as transactions,
            SUM(amount) as revenue,
            AVG(amount) as avgOrderValue
          FROM transactions 
          ${whereClause}
          GROUP BY brand, category
          ORDER BY revenue DESC
        `, queryParams)
      ]);

      // Format and return comprehensive response
      const analytics = {
        summary: summaryResult[0] || {
          totalRevenue: 0,
          totalTransactions: 0,
          averageOrderValue: 0,
          topCategory: 'N/A',
          growthRate: 0,
          lastUpdated: new Date().toISOString()
        },
        transactions: transactionTrendsResult || [],
        categories: categoryPerformanceResult || [],
        regions: regionalAnalyticsResult || [],
        brands: brandPerformanceResult || [],
        meta: {
          generatedAt: new Date().toISOString(),
          filters: {
            period,
            region: region || null,
            category: category || null,
            brand: brand || null
          },
          totalDataPoints: {
            transactions: transactionTrendsResult?.length || 0,
            categories: categoryPerformanceResult?.length || 0,
            regions: regionalAnalyticsResult?.length || 0,
            brands: brandPerformanceResult?.length || 0
          }
        }
      };

      res.json({
        success: true,
        data: analytics,
        message: 'Scout Analytics data retrieved successfully'
      });

    } catch (error) {
      console.error('Scout Analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Scout Analytics data',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * @swagger
   * /api/scout/health:
   *   get:
   *     summary: Health check for Scout Analytics system
   *     tags: [Scout Analytics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Scout Analytics system health
   */
  async healthCheck(req, res) {
    try {
      // Test database connectivity and basic query
      const testQuery = 'SELECT COUNT(*) as transactionCount FROM transactions WHERE date >= DATEADD(day, -1, GETDATE())';
      const result = await database.query(testQuery);
      
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        data: {
          database: 'connected',
          recentTransactions: result[0]?.transactionCount || 0,
          system: 'operational'
        }
      });

    } catch (error) {
      console.error('Scout health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }
}

module.exports = new ScoutController();