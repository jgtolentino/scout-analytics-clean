-- Create substitution_summary view in gold schema
-- This view tracks brand substitutions when requested brand differs from fulfilled brand

CREATE OR REPLACE VIEW gold.substitution_summary AS
WITH substitution_pairs AS (
  SELECT 
    ti.transaction_id,
    t.store_id,
    t.transaction_date,
    ti.lead_brand_id,
    ti.fulfilled_brand_id,
    lb.brand_name AS source_brand,
    fb.brand_name AS target_brand,
    ti.quantity,
    ti.price,
    ti.quantity * ti.price AS substitution_value
  FROM silver.transaction_items ti
  JOIN silver.transactions t ON ti.transaction_id = t.transaction_id
  LEFT JOIN bronze.brands lb ON ti.lead_brand_id = lb.brand_id
  LEFT JOIN bronze.brands fb ON ti.fulfilled_brand_id = fb.brand_id
  WHERE ti.lead_brand_id IS NOT NULL 
    AND ti.fulfilled_brand_id IS NOT NULL
    AND ti.lead_brand_id != ti.fulfilled_brand_id
),
aggregated_substitutions AS (
  SELECT 
    source_brand,
    target_brand,
    COUNT(DISTINCT transaction_id) AS substitution_count,
    SUM(quantity) AS total_quantity,
    SUM(substitution_value) AS total_value,
    AVG(substitution_value) AS avg_substitution_value
  FROM substitution_pairs
  GROUP BY source_brand, target_brand
)
SELECT 
  source_brand,
  target_brand,
  substitution_count,
  total_quantity,
  total_value,
  avg_substitution_value,
  -- Calculate substitution rate (what % of source brand requests result in this substitution)
  ROUND(100.0 * substitution_count / SUM(substitution_count) OVER (PARTITION BY source_brand), 2) AS substitution_rate_pct,
  -- Rank substitutions by frequency for each source brand
  ROW_NUMBER() OVER (PARTITION BY source_brand ORDER BY substitution_count DESC) AS substitution_rank,
  -- Data quality indicators
  CASE 
    WHEN substitution_count >= 10 THEN 1.0
    WHEN substitution_count >= 5 THEN 0.8
    ELSE 0.6
  END AS data_quality_score,
  1.0 AS data_coverage_pct -- Assuming complete coverage for substitution tracking
FROM aggregated_substitutions
WHERE substitution_count >= 2; -- Filter out one-off substitutions for cleaner visualization

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transaction_items_substitution 
ON silver.transaction_items(lead_brand_id, fulfilled_brand_id) 
WHERE lead_brand_id IS NOT NULL AND fulfilled_brand_id IS NOT NULL;

-- Create a complementary view for time-based substitution trends
CREATE OR REPLACE VIEW gold.substitution_trends AS
SELECT 
  DATE_TRUNC('week', t.transaction_date) AS week_start,
  lb.brand_name AS source_brand,
  fb.brand_name AS target_brand,
  COUNT(*) AS weekly_substitutions,
  SUM(ti.quantity * ti.price) AS weekly_value
FROM silver.transaction_items ti
JOIN silver.transactions t ON ti.transaction_id = t.transaction_id
LEFT JOIN bronze.brands lb ON ti.lead_brand_id = lb.brand_id
LEFT JOIN bronze.brands fb ON ti.fulfilled_brand_id = fb.brand_id
WHERE ti.lead_brand_id != ti.fulfilled_brand_id
  AND ti.lead_brand_id IS NOT NULL
  AND ti.fulfilled_brand_id IS NOT NULL
  AND t.transaction_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1, 2, 3;

-- Grant permissions
GRANT SELECT ON gold.substitution_summary TO authenticated;
GRANT SELECT ON gold.substitution_trends TO authenticated;