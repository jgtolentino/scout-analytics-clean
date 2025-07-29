#!/bin/bash

# Script to test RLS access after migration
# Run this in Supabase SQL editor or via CLI

echo "Testing RLS access for gold schema..."

# Test authenticated user access
cat << 'EOF'
-- Test as authenticated user
SET ROLE authenticated;

-- Test executive KPI access
SELECT COUNT(*) as count, 'executive_kpi_summary' as table_name 
FROM gold.executive_kpi_summary
UNION ALL
-- Test daily summary access
SELECT COUNT(*), 'daily_transaction_summary' 
FROM gold.daily_transaction_summary
UNION ALL
-- Test top products access
SELECT COUNT(*), 'top_products_view' 
FROM gold.top_products_view
UNION ALL
-- Test demographics access
SELECT COUNT(*), 'demographics_view' 
FROM gold.demographics_view
UNION ALL
-- Test substitution summary access
SELECT COUNT(*), 'substitution_summary' 
FROM gold.substitution_summary
UNION ALL
-- Test request mode summary access
SELECT COUNT(*), 'request_mode_summary' 
FROM gold.request_mode_summary;

-- Test RLS function
SELECT * FROM gold.test_rls_access();

-- Reset role
RESET ROLE;
EOF

echo "RLS test queries generated. Run these in Supabase SQL editor."