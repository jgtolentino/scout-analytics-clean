-- Enable RLS on all gold schema tables
-- This migration adds row-level security policies to production data views

-- Enable RLS on core tables
ALTER TABLE gold.executive_kpi_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.daily_transaction_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.top_products_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.demographics_view ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.substitution_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold.behavior_metrics_view ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all gold data
CREATE POLICY "authenticated_read_executive_kpi" ON gold.executive_kpi_summary
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_read_daily_summary" ON gold.daily_transaction_summary
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_read_top_products" ON gold.top_products_view
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_read_demographics" ON gold.demographics_view
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_read_substitution" ON gold.substitution_summary
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_read_behavior" ON gold.behavior_metrics_view
  FOR SELECT USING (auth.role() = 'authenticated');

-- Add service role bypass for ETL processes
CREATE POLICY "service_role_all_executive_kpi" ON gold.executive_kpi_summary
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "service_role_all_daily_summary" ON gold.daily_transaction_summary
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create smoke test function
CREATE OR REPLACE FUNCTION gold.test_rls_access()
RETURNS TABLE(
  table_name text,
  accessible boolean,
  row_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'executive_kpi_summary'::text, 
         EXISTS(SELECT 1 FROM gold.executive_kpi_summary LIMIT 1),
         (SELECT COUNT(*) FROM gold.executive_kpi_summary);
  
  RETURN QUERY
  SELECT 'daily_transaction_summary'::text,
         EXISTS(SELECT 1 FROM gold.daily_transaction_summary LIMIT 1),
         (SELECT COUNT(*) FROM gold.daily_transaction_summary);
         
  RETURN QUERY
  SELECT 'top_products_view'::text,
         EXISTS(SELECT 1 FROM gold.top_products_view LIMIT 1),
         (SELECT COUNT(*) FROM gold.top_products_view);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION gold.test_rls_access() TO authenticated;