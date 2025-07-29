-- Add request_mode_enum to silver.transactions
-- This tracks how customers made their purchase request

-- Create enum type for request modes
CREATE TYPE request_mode_enum AS ENUM ('verbal', 'point', 'indirect', 'unknown');

-- Add column to transactions table
ALTER TABLE silver.transactions 
ADD COLUMN request_mode request_mode_enum DEFAULT 'unknown';

-- Create index for performance
CREATE INDEX idx_transactions_request_mode ON silver.transactions(request_mode);

-- Backfill data based on existing patterns (if any text indicators exist)
-- This is a sample backfill - adjust based on your actual data patterns
UPDATE silver.transactions
SET request_mode = 
  CASE 
    WHEN metadata->>'interaction_type' = 'verbal' THEN 'verbal'::request_mode_enum
    WHEN metadata->>'interaction_type' = 'pointing' THEN 'point'::request_mode_enum
    WHEN metadata->>'interaction_type' = 'gesture' THEN 'point'::request_mode_enum
    WHEN metadata->>'interaction_type' = 'indirect' THEN 'indirect'::request_mode_enum
    WHEN metadata->>'request_method' ILIKE '%verbal%' THEN 'verbal'::request_mode_enum
    WHEN metadata->>'request_method' ILIKE '%point%' THEN 'point'::request_mode_enum
    WHEN transaction_notes ILIKE '%pointed%' THEN 'point'::request_mode_enum
    WHEN transaction_notes ILIKE '%asked for%' THEN 'verbal'::request_mode_enum
    WHEN transaction_notes ILIKE '%described%' THEN 'indirect'::request_mode_enum
    ELSE 'unknown'::request_mode_enum
  END
WHERE request_mode = 'unknown';

-- Create view for request mode analytics
CREATE OR REPLACE VIEW gold.request_mode_summary AS
SELECT 
  request_mode,
  COUNT(*) AS transaction_count,
  SUM(total_amount) AS total_revenue,
  AVG(total_amount) AS avg_transaction_value,
  COUNT(DISTINCT customer_id) AS unique_customers,
  COUNT(DISTINCT store_id) AS stores_affected,
  -- Calculate percentage distribution
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS percentage,
  -- Data quality score based on known vs unknown
  CASE 
    WHEN request_mode != 'unknown' THEN 1.0
    ELSE 0.5
  END AS data_quality_score,
  1.0 AS data_coverage_pct
FROM silver.transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY request_mode;

-- Create time-based view for trends
CREATE OR REPLACE VIEW gold.request_mode_trends AS
SELECT 
  DATE_TRUNC('week', transaction_date) AS week_start,
  request_mode,
  COUNT(*) AS weekly_count,
  SUM(total_amount) AS weekly_revenue
FROM silver.transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '90 days'
  AND request_mode != 'unknown'
GROUP BY 1, 2
ORDER BY 1, 2;

-- Grant permissions
GRANT SELECT ON gold.request_mode_summary TO authenticated;
GRANT SELECT ON gold.request_mode_trends TO authenticated;

-- Create function to update request mode (for real-time updates)
CREATE OR REPLACE FUNCTION silver.update_transaction_request_mode(
  p_transaction_id UUID,
  p_request_mode request_mode_enum
)
RETURNS void AS $$
BEGIN
  UPDATE silver.transactions
  SET request_mode = p_request_mode,
      updated_at = CURRENT_TIMESTAMP
  WHERE transaction_id = p_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION silver.update_transaction_request_mode TO authenticated;