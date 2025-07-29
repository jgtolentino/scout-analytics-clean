import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const minValue = parseInt(searchParams.get('min_value') || '1000');
    
    // Build query
    let query = supabase
      .from('substitution_summary')
      .select('*')
      .gte('total_value', minValue)
      .order('total_value', { ascending: false })
      .limit(limit);
    
    // Add store filter if provided (would need to join with transactions)
    // For now, we'll return all substitutions
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Substitution query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch substitution data' },
        { status: 500 }
      );
    }
    
    // Transform data for Sankey format if needed
    const sankeyData = data?.map(item => ({
      source: item.source_brand,
      target: item.target_brand,
      value: item.total_value,
      count: item.substitution_count,
      rate: item.substitution_rate_pct,
      data_quality_score: item.data_quality_score,
      data_coverage_pct: item.data_coverage_pct
    }));
    
    return NextResponse.json({
      data: sankeyData || [],
      metadata: {
        total: data?.length || 0,
        avg_quality: data?.reduce((sum, item) => sum + item.data_quality_score, 0) / (data?.length || 1),
        timestamp: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}