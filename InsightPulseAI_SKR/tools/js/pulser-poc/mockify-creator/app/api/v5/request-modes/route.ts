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
    
    // Fetch request mode summary
    const { data, error } = await supabase
      .from('request_mode_summary')
      .select('*')
      .order('transaction_count', { ascending: false });
    
    if (error) {
      console.error('Request mode query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch request mode data' },
        { status: 500 }
      );
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