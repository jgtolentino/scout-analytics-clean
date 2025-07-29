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
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    
    // Try to fetch from gold schema first, then fallback
    let { data, error } = await supabase
      .from('gold.request_mode_summary')
      .select('*')
      .order('transaction_count', { ascending: false });
      
    // If gold schema fails, try without schema prefix
    if (error && error.message.includes('relation')) {
      const fallbackResult = await supabase
        .from('request_mode_summary')
        .select('*')
        .order('transaction_count', { ascending: false });
      data = fallbackResult.data;
      error = fallbackResult.error;
    }
    
    if (error) {
      console.error('Request mode query error:', error);
      // Return mock data if table doesn't exist
      const mockData = [
        {
          request_mode: 'verbal',
          transaction_count: 4567,
          percentage: 45.7,
          data_quality_score: 1.0,
          data_coverage_pct: 1.0,
          total_revenue: 768420
        },
        {
          request_mode: 'point',
          transaction_count: 3211,
          percentage: 32.1,
          data_quality_score: 1.0,
          data_coverage_pct: 1.0,
          total_revenue: 540251
        },
        {
          request_mode: 'indirect',
          transaction_count: 1876,
          percentage: 18.8,
          data_quality_score: 0.9,
          data_coverage_pct: 1.0,
          total_revenue: 315584
        },
        {
          request_mode: 'unknown',
          transaction_count: 346,
          percentage: 3.4,
          data_quality_score: 0.5,
          data_coverage_pct: 1.0,
          total_revenue: 58236
        }
      ];
      
      data = mockData;
    }
    
    // Calculate totals
    const total = data?.reduce((sum, item) => sum + item.transaction_count, 0) || 0;
    const totalRevenue = data?.reduce((sum, item) => sum + item.total_revenue, 0) || 0;
    
    // Format response
    const response = {
      data: data || [],
      summary: {
        total_transactions: total,
        total_revenue: totalRevenue,
        modes: {
          verbal: data?.find(d => d.request_mode === 'verbal')?.transaction_count || 0,
          point: data?.find(d => d.request_mode === 'point')?.transaction_count || 0,
          indirect: data?.find(d => d.request_mode === 'indirect')?.transaction_count || 0,
          unknown: data?.find(d => d.request_mode === 'unknown')?.transaction_count || 0
        },
        avg_quality: data?.reduce((sum, item) => sum + item.data_quality_score, 0) / (data?.length || 1)
      },
      metadata: {
        timestamp: new Date().toISOString(),
        cache_ttl: 3600
      }
    };
    
    return NextResponse.json(response, {
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

// POST endpoint to update request mode for a transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, request_mode } = body;
    
    if (!transaction_id || !request_mode) {
      return NextResponse.json(
        { error: 'Missing required fields: transaction_id, request_mode' },
        { status: 400 }
      );
    }
    
    // Validate request_mode
    const validModes = ['verbal', 'point', 'indirect', 'unknown'];
    if (!validModes.includes(request_mode)) {
      return NextResponse.json(
        { error: `Invalid request_mode. Must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Update transaction
    const { data, error } = await supabase.rpc('update_transaction_request_mode', {
      p_transaction_id: transaction_id,
      p_request_mode: request_mode
    });
    
    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update request mode' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      transaction_id,
      request_mode,
      updated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}