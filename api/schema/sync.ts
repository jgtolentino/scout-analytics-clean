import { NextApiRequest, NextApiResponse } from 'next';
import { SchemaSync } from '../../../scripts/schemaSync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const schemaSync = new SchemaSync();
    
    console.log('🔍 Starting schema sync via API...');
    const driftReport = await schemaSync.syncSchemas();
    
    await schemaSync.close();
    
    res.status(200).json(driftReport);
  } catch (error) {
    console.error('❌ Schema sync API error:', error);
    res.status(500).json({ 
      error: 'Schema sync failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 