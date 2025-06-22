import { NextApiRequest, NextApiResponse } from 'next';
import { SchemaSync } from '../../../scripts/schemaSync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const schemaSync = new SchemaSync();
    
    console.log('🔍 Starting FK integrity check via API...');
    const fkReport = await schemaSync.checkFKIntegrity();
    
    await schemaSync.close();
    
    res.status(200).json(fkReport);
  } catch (error) {
    console.error('❌ FK integrity check API error:', error);
    res.status(500).json({ 
      error: 'FK integrity check failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 