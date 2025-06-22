import { NextApiRequest, NextApiResponse } from 'next';
import { SchemaSync } from '../../scripts/schemaSync';
import { schemaAgent } from '../../agents/dash/schemaAgent';

/**
 * GET /api/schema/check
 * Check for schema drift and return report
 */
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const schemaSync = new SchemaSync();
    const report = await schemaSync.syncSchemas();
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Schema check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to check schema drift'
    });
  }
}

/**
 * POST /api/schema/apply
 * Apply migration SQL to fix schema drift
 */
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { sql } = req.body;
    
    if (!sql) {
      return res.status(400).json({
        success: false,
        error: 'Missing SQL parameter',
        message: 'Migration SQL is required'
      });
    }

    // Validate SQL (basic check)
    if (!sql.trim().toLowerCase().startsWith('alter') && 
        !sql.trim().toLowerCase().startsWith('create') &&
        !sql.trim().toLowerCase().startsWith('drop')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SQL',
        message: 'Only ALTER, CREATE, and DROP statements are allowed'
      });
    }

    // Apply the migration
    const schemaSync = new SchemaSync();
    await schemaSync.applyMigration(sql);
    
    // Re-check schema after applying
    const report = await schemaSync.syncSchemas();
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Migration applied successfully',
        report
      }
    });
  } catch (error) {
    console.error('Migration application failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to apply migration'
    });
  }
}

/**
 * GET /api/schema/health
 * Get current schema health status
 */
export async function GET_HEALTH(req: NextApiRequest, res: NextApiResponse) {
  try {
    const status = schemaAgent.getHealthStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get health status'
    });
  }
}

/**
 * POST /api/schema/health/check
 * Force a health check
 */
export async function POST_HEALTH_CHECK(req: NextApiRequest, res: NextApiResponse) {
  try {
    const status = await schemaAgent.forceHealthCheck();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Forced health check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to perform health check'
    });
  }
}

/**
 * GET /api/schema/fk-integrity
 * Check foreign key integrity
 */
export async function GET_FK_INTEGRITY(req: NextApiRequest, res: NextApiResponse) {
  try {
    const schemaSync = new SchemaSync();
    const fkReport = await schemaSync.checkFKIntegrity();
    
    res.status(200).json({
      success: true,
      data: fkReport
    });
  } catch (error) {
    console.error('FK integrity check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to check FK integrity'
    });
  }
}

// Export all handlers
export default {
  GET,
  POST,
  GET_HEALTH,
  POST_HEALTH_CHECK,
  GET_FK_INTEGRITY
}; 