import { NextApiRequest, NextApiResponse } from 'next';
import { SchemaSync } from '../../../scripts/schemaSync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { migrationSQL } = req.body;
    
    if (!migrationSQL) {
      return res.status(400).json({ error: 'Migration SQL is required' });
    }

    const schemaSync = new SchemaSync();
    
    console.log('📝 Applying migration via API...');
    await schemaSync.applyMigration(migrationSQL);
    
    await schemaSync.close();
    
    res.status(200).json({ 
      success: true, 
      message: 'Migration applied successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Migration API error:', error);
    res.status(500).json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 