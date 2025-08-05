# 📊 Scout Dashboard Visualization Blueprint

## Overview
This document provides a comprehensive chart-by-chart specification for the Scout Dashboard, detailing the visualization types, data requirements, interactions, and AI integration for each dashboard page.

---

## 🧭 1. Executive Overview Page

**Purpose:** High-level, at-a-glance performance view for executives and decision-makers.

### Chart Specifications

#### 1.1 Total Revenue KPI Card
```yaml
type: kpi_card
zone_id: exec-revenue-kpi
position: { x: 0, y: 0, w: 3, h: 2 }
data_requirements:
  - metric: total_revenue
  - comparison: previous_period
  - sparkline: last_30_days
visualization:
  primary_value: "₱{value:currency}"
  change_indicator: "{change:percentage}"
  sparkline_type: area
  color_scheme: revenue_gradient
interactions:
  hover: Show daily breakdown tooltip
  click: Navigate to Analytics Deep Dive
  ai_overlay: "Explain revenue trend"
filters:
  - date_range
  - region
  - product_category
```

#### 1.2 Top Performing Region Donut Chart
```yaml
type: donut_chart
zone_id: exec-region-performance
position: { x: 3, y: 0, w: 3, h: 2 }
data_requirements:
  - dimension: region
  - metric: revenue_share
  - sort: descending
  - limit: 5
visualization:
  inner_radius: 60%
  labels: percentage_and_value
  legend: right
  color_palette: regional_colors
interactions:
  drill_down:
    - level_1: region → city
    - level_2: city → barangay
  hover: Highlight segment + show details
  ai_overlay: "Which region should we focus on?"
```

#### 1.3 Persona Mix Demographics
```yaml
type: stacked_bar_chart
zone_id: exec-persona-demographics
position: { x: 6, y: 0, w: 6, h: 2 }
data_requirements:
  - dimensions: [age_group, gender]
  - metric: customer_count
  - segmentation: persona_type
visualization:
  orientation: horizontal
  stack_mode: percentage
  show_values: true
  color_mapping:
    male: "#3B82F6"
    female: "#EC4899"
    other: "#8B5CF6"
interactions:
  drill_down:
    enabled: true
    path: persona → purchase_history
  selection: Multi-select for filtering
  ai_overlay: "Persona insights and recommendations"
```

#### 1.4 Product Category Performance
```yaml
type: horizontal_bar_chart
zone_id: exec-category-performance
position: { x: 0, y: 2, w: 6, h: 3 }
data_requirements:
  - dimension: product_category
  - metrics: [revenue, units_sold, growth_rate]
  - sort_by: revenue
  - top_n: 10
visualization:
  bar_type: grouped
  show_data_labels: true
  reference_line: average_revenue
  conditional_formatting:
    growth_positive: green
    growth_negative: red
interactions:
  drill_down:
    - level_1: category → brand
    - level_2: brand → sku
  hover: Show full metrics panel
  context_menu: Export category data
```

#### 1.5 Campaign Effectiveness Timeline
```yaml
type: vertical_bar_chart
zone_id: exec-campaign-timeline
position: { x: 6, y: 2, w: 6, h: 3 }
data_requirements:
  - dimension: campaign_date
  - metrics: [uplift_percentage, baseline_revenue]
  - granularity: daily
  - range: last_90_days
visualization:
  dual_axis: true
  bar_opacity: 0.7
  line_type: smooth
  annotations: campaign_markers
interactions:
  zoom: Enable x-axis zoom
  pan: Enable horizontal pan
  drill_down: campaign → product_performance
  ai_overlay: "Campaign ROI analysis"
```

---

## 📊 2. Analytics Deep Dive Page

**Purpose:** Exploratory view for analysts and power users to uncover insights.

### Chart Specifications

#### 2.1 Revenue Trends Multi-Line Chart
```yaml
type: multi_line_chart
zone_id: analytics-revenue-trends
position: { x: 0, y: 0, w: 8, h: 4 }
data_requirements:
  - dimension: date
  - metrics: [revenue, transactions, avg_basket_size]
  - series_by: [region, product_category]
  - granularity: adjustable (hour/day/week/month)
visualization:
  line_style: smooth
  show_points: on_hover
  enable_area_fill: optional
  y_axis: dual_scale
  legend: interactive
interactions:
  drill_down:
    enabled: true
    context: maintain_time_range
  brush_selection: true
  series_toggle: show/hide lines
  export: CSV, PNG
  ai_overlay: "Anomaly detection + forecast"
```

#### 2.2 Basket Size Distribution Box Plot
```yaml
type: box_plot
zone_id: analytics-basket-distribution
position: { x: 8, y: 0, w: 4, h: 4 }
data_requirements:
  - metric: basket_size
  - grouping: [day_of_week, customer_type]
  - outlier_detection: true
visualization:
  show_outliers: true
  whisker_type: 1.5_iqr
  mean_indicator: diamond
  color_by: customer_type
interactions:
  hover: Show statistical details
  click_outlier: View transaction details
  filter: Remove outliers option
  ai_overlay: "Basket optimization suggestions"
```

#### 2.3 Transaction Heatmap Grid
```yaml
type: heatmap
zone_id: analytics-transaction-heatmap
position: { x: 0, y: 4, w: 6, h: 4 }
data_requirements:
  - x_axis: hour_of_day (0-23)
  - y_axis: day_of_week
  - metric: transaction_volume
  - aggregation: sum
visualization:
  color_scale: sequential_warm
  show_values: true
  cell_border: subtle
  empty_cells: show_as_zero
interactions:
  hover: Show exact count + % of total
  click: Filter dashboard to time slot
  selection: Rectangle selection for bulk
  ai_overlay: "Optimal staffing recommendations"
```

#### 2.4 Predictive Revenue Forecast
```yaml
type: area_chart_with_forecast
zone_id: analytics-revenue-forecast
position: { x: 6, y: 4, w: 6, h: 4 }
data_requirements:
  - historical: last_90_days
  - forecast: next_30_days
  - confidence_intervals: [80%, 95%]
  - seasonality: auto_detect
visualization:
  historical_style: solid_line
  forecast_style: dashed_line
  confidence_bands: gradient_fill
  annotations: forecast_start_marker
interactions:
  adjust_parameters: Show forecast config
  scenario_modeling: What-if analysis
  export: Include forecast methodology
  ai_overlay: "Forecast accuracy insights"
```

#### 2.5 Brand Substitution Sankey Diagram
```yaml
type: sankey_diagram
zone_id: analytics-brand-flow
position: { x: 0, y: 8, w: 12, h: 4 }
data_requirements:
  - from_nodes: original_brand_preference
  - to_nodes: actual_purchase_brand
  - flow_value: customer_count
  - min_flow_threshold: 10
visualization:
  node_width: 20px
  node_padding: 10px
  link_opacity: 0.5
  color_scheme: brand_colors
  show_percentages: true
interactions:
  hover: Highlight flow path
  click_node: Filter to brand
  click_link: Show substitution details
  ai_overlay: "Brand loyalty insights"
```

---

## 🧠 3. Consumer Insights Page

**Purpose:** Behavioral analysis and consumer intent understanding.

### Chart Specifications

#### 3.1 Request Mode Analysis
```yaml
type: stacked_bar_100_percent
zone_id: insights-request-mode
position: { x: 0, y: 0, w: 6, h: 3 }
data_requirements:
  - dimension: region
  - categories: [branded_request, unbranded_request]
  - metric: request_count
visualization:
  orientation: vertical
  show_percentages: true
  pattern_fill: optional
  legend: top
interactions:
  drill_down: region → store → time_period
  compare_mode: Side-by-side regions
  ai_overlay: "Brand awareness analysis"
```

#### 3.2 Store Suggestion Acceptance Gauge
```yaml
type: gauge_chart
zone_id: insights-suggestion-acceptance
position: { x: 6, y: 0, w: 3, h: 3 }
data_requirements:
  - metric: acceptance_rate
  - target: 75%
  - benchmark: industry_average
visualization:
  min_value: 0
  max_value: 100
  color_ranges:
    poor: [0, 50, "#EF4444"]
    fair: [50, 75, "#F59E0B"]
    good: [75, 100, "#10B981"]
  needle_animation: smooth
interactions:
  click: Show acceptance trend
  hover: Display exact percentage
  ai_overlay: "Recommendation effectiveness"
```

#### 3.3 Customer Spend Segmentation
```yaml
type: horizontal_bar_grouped
zone_id: insights-spend-segments
position: { x: 9, y: 0, w: 3, h: 3 }
data_requirements:
  - dimension: spend_bracket
  - metrics: [customer_count, avg_frequency]
  - brackets: [0-500, 500-1000, 1000-5000, 5000+]
visualization:
  show_values: true
  currency_format: true
  gradient_fill: by_value
interactions:
  drill_down: bracket → customer_list
  selection: Multi-select brackets
  ai_overlay: "Segment growth opportunities"
```

#### 3.4 Unbranded Request Word Cloud
```yaml
type: word_cloud
zone_id: insights-unbranded-requests
position: { x: 0, y: 3, w: 6, h: 4 }
data_requirements:
  - text_field: unbranded_request_text
  - frequency: request_count
  - min_frequency: 5
  - stop_words: filipino_stop_words
visualization:
  max_words: 100
  rotation: horizontal_only
  color_scheme: category_based
  size_range: [12, 48]
interactions:
  click_word: Filter to requests
  hover: Show frequency + examples
  export: Word frequency table
  ai_overlay: "Product opportunity analysis"
```

#### 3.5 Consumer Journey Funnel
```yaml
type: funnel_chart
zone_id: insights-consumer-journey
position: { x: 6, y: 3, w: 6, h: 4 }
data_requirements:
  - stages: [browse, inquire, add_to_cart, purchase, repeat]
  - metric: user_count
  - conversion_rates: calculate
visualization:
  shape: curved_funnel
  show_percentages: true
  show_drop_offs: true
  color_gradient: true
interactions:
  click_stage: Show stage details
  compare: Period over period
  segment_by: customer_type
  ai_overlay: "Conversion optimization tips"
```

---

## 🌍 4. Geographic Intelligence Page

**Purpose:** Location-based insights and geographic market analysis.

### Chart Specifications

#### 4.1 Regional Revenue Choropleth Map
```yaml
type: choropleth_map
zone_id: geo-revenue-map
position: { x: 0, y: 0, w: 8, h: 6 }
data_requirements:
  - geography: philippines_regions
  - metric: revenue_per_capita
  - boundaries: region/province/city/barangay
visualization:
  projection: mercator
  color_scale: sequential_blues
  show_labels: on_zoom
  legend: gradient_bar
interactions:
  drill_down:
    - click: region → province
    - click: province → city
    - click: city → barangay
  hover: Show metrics tooltip
  pan_zoom: enabled
  selection: Multi-select regions
  ai_overlay: "Market opportunity heat zones"
```

#### 4.2 Demographic Bubble Layer
```yaml
type: bubble_map_overlay
zone_id: geo-demographic-bubbles
position: { x: 0, y: 0, w: 8, h: 6 }
data_requirements:
  - coordinates: store_locations
  - bubble_size: population_served
  - bubble_color: market_share
  - max_bubbles: 500
visualization:
  bubble_opacity: 0.7
  size_range: [10, 50]
  color_scale: diverging
  cluster_on_zoom: true
interactions:
  click_bubble: Show store details
  hover: Population + share info
  filter: By demographic criteria
  ai_overlay: "Expansion recommendations"
```

#### 4.3 Region Comparison Table
```yaml
type: data_table_with_sparklines
zone_id: geo-comparison-table
position: { x: 8, y: 0, w: 4, h: 6 }
data_requirements:
  - dimensions: [region, city]
  - metrics: [revenue, growth, market_share]
  - sparkline_data: last_12_weeks
  - sort: configurable
visualization:
  row_height: compact
  alternating_rows: true
  sparkline_type: line
  conditional_formatting:
    growth: color_scale
    share: data_bars
interactions:
  sort: Click column headers
  filter: Quick filter bar
  export: Excel with formatting
  drill_down: Row click → details
```

#### 4.4 Geographic Anomaly Heatmap
```yaml
type: heat_zone_overlay
zone_id: geo-anomaly-heat
position: { x: 0, y: 6, w: 12, h: 4 }
data_requirements:
  - anomaly_scores: by_location
  - threshold: statistical_significance
  - time_window: real_time
visualization:
  heat_radius: adaptive
  intensity: anomaly_score
  color_scale: red_yellow
  animation: pulse_on_new
interactions:
  click_zone: Show anomaly details
  time_scrubber: Historical playback
  alert_config: Set thresholds
  ai_overlay: "Anomaly explanation + actions"
```

---

## 📁 5. Reports & Export Page

**Purpose:** Self-service reporting, saved queries, and data export.

### Chart Specifications

#### 5.1 Saved Queries List
```yaml
type: searchable_list
zone_id: reports-saved-queries
position: { x: 0, y: 0, w: 4, h: 6 }
data_requirements:
  - query_metadata: [name, author, created, last_run]
  - categories: user_defined_tags
  - permissions: view/edit/delete
visualization:
  layout: card_grid
  show_preview: true
  tags: colored_chips
  search: fuzzy_match
interactions:
  click: Load query
  hover: Show description
  actions: Edit, Duplicate, Delete
  share: Generate shareable link
```

#### 5.2 Active Filters Summary
```yaml
type: filter_pills
zone_id: reports-filter-summary
position: { x: 4, y: 0, w: 4, h: 2 }
data_requirements:
  - active_filters: global_filter_state
  - filter_logic: AND/OR
visualization:
  pill_style: removable
  group_by: filter_type
  show_operators: true
interactions:
  click_pill: Edit filter
  click_x: Remove filter
  drag: Reorder filters
  save: Save filter preset
```

#### 5.3 Report Preview Canvas
```yaml
type: dynamic_chart_embed
zone_id: reports-preview
position: { x: 4, y: 2, w: 8, h: 4 }
data_requirements:
  - chart_config: user_selected
  - data_source: filtered_dataset
  - refresh_rate: manual
visualization:
  container: responsive
  maintain_aspect: true
  show_toolbar: true
interactions:
  edit: Modify chart type
  configure: Adjust settings
  fullscreen: Expand view
  export: Multiple formats
```

#### 5.4 Export History Log
```yaml
type: activity_timeline
zone_id: reports-export-log
position: { x: 0, y: 6, w: 12, h: 4 }
data_requirements:
  - events: export_history
  - metadata: [user, timestamp, format, filters]
  - retention: 30_days
visualization:
  layout: chronological
  group_by: date
  show_details: expandable
  icons: by_format
interactions:
  click_item: Re-run export
  filter: By date, user, type
  bulk_actions: Delete old exports
  download: Retrieve export file
```

---

## 🤖 6. AI Assistant Panel (Suqi)

**Purpose:** Contextual AI assistance across all dashboard pages.

### Component Specifications

#### 6.1 Suqi Chat Interface
```yaml
type: ai_chat_panel
zone_id: ai-assistant-suqi
position: floating_right_panel
data_requirements:
  - context: current_page_state
  - history: conversation_memory
  - capabilities: [explain, predict, recommend]
visualization:
  style: collapsible_sidebar
  width: 350px
  theme: inherit_dashboard
  typing_indicator: true
interactions:
  trigger: Click AI button or hotkey
  input: Natural language queries
  suggestions: Context-aware prompts
  actions: Apply AI recommendations
```

#### 6.2 Context-Aware Suggestions
```yaml
type: suggestion_cards
zone_id: ai-suggestions
position: within_chat_panel
data_requirements:
  - active_chart: currently_focused
  - user_behavior: interaction_history
  - insights: pre_computed
visualization:
  card_layout: vertical_stack
  max_suggestions: 3
  refresh_on: context_change
examples:
  - "Why did revenue spike in NCR last week?"
  - "Which product should we promote in Cebu?"
  - "Forecast next month's sales for beverages"
  - "Find anomalies in today's transactions"
```

#### 6.3 AI-Generated Insights Overlay
```yaml
type: insight_overlay
zone_id: ai-insight-overlay
position: chart_overlay
data_requirements:
  - trigger: hover_or_selection
  - computation: real_time
  - confidence: show_percentage
visualization:
  style: translucent_card
  position: smart_placement
  animation: fade_in
  dismiss: click_outside
interactions:
  pin: Keep insight visible
  expand: Show detailed analysis
  apply: Update chart/filter
  feedback: Thumbs up/down
```

---

## 📊 Visual Encoding Standards

### Color Palettes
```yaml
semantic_colors:
  positive: "#10B981"  # Green
  negative: "#EF4444"  # Red
  neutral: "#6B7280"   # Gray
  primary: "#3B82F6"   # Blue
  secondary: "#8B5CF6" # Purple

sequential_scales:
  blues: ["#EFF6FF", "#3B82F6", "#1E3A8A"]
  greens: ["#F0FDF4", "#10B981", "#064E3B"]
  warm: ["#FEF3C7", "#F59E0B", "#92400E"]

categorical_colors:
  default: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]
  regions: {
    ncr: "#3B82F6",
    luzon: "#10B981",
    visayas: "#F59E0B",
    mindanao: "#8B5CF6"
  }
```

### Chart Size Guidelines
```yaml
grid_system:
  columns: 12
  rows: variable
  gap: 16px

minimum_sizes:
  kpi_card: { w: 2, h: 2 }
  chart: { w: 3, h: 3 }
  table: { w: 4, h: 3 }
  map: { w: 6, h: 4 }

recommended_sizes:
  kpi_card: { w: 3, h: 2 }
  line_chart: { w: 6, h: 4 }
  bar_chart: { w: 6, h: 4 }
  donut_chart: { w: 3, h: 3 }
  map: { w: 8, h: 6 }
  table: { w: 6, h: 4 }
```

### Interaction Patterns
```yaml
standard_interactions:
  hover:
    - Show tooltip
    - Highlight element
    - Display details
  
  click:
    - Select item
    - Drill down
    - Open context menu
  
  drag:
    - Pan map/chart
    - Resize zone
    - Reorder items
  
  right_click:
    - Context menu
    - Quick actions
    - Export options

drill_down_patterns:
  hierarchical: region → city → barangay → store
  temporal: year → quarter → month → week → day
  categorical: category → brand → product → sku
```

---

## 🔧 Implementation Guidelines

### 1. Zone Registration
```typescript
// Register each chart type as a Scout zone
ZoneRegistry.register('kpi-card', KPICardZone);
ZoneRegistry.register('donut-chart', DonutChartZone);
ZoneRegistry.register('choropleth-map', ChoroplethMapZone);
```

### 2. Data Binding
```typescript
// Example data requirements for a zone
const revenueKPIData = {
  query: `
    SELECT 
      SUM(revenue) as total_revenue,
      SUM(revenue) - LAG(SUM(revenue)) OVER (ORDER BY date) as change,
      date
    FROM sales
    WHERE date >= :startDate
    GROUP BY date
  `,
  parameters: ['startDate', 'endDate', 'region'],
  refreshInterval: 300000 // 5 minutes
};
```

### 3. AI Context Provider
```typescript
// Provide context to Suqi for each zone
const getAIContext = (zone: DashboardZone) => ({
  zoneType: zone.type,
  currentData: zone.data,
  filters: getActiveFilters(),
  userQuestion: getCurrentQuery(),
  historicalInsights: getZoneInsights(zone.id)
});
```

### 4. Export Configuration
```typescript
// Define export options per chart type
const exportConfig = {
  'kpi-card': ['png', 'json'],
  'line-chart': ['png', 'svg', 'csv'],
  'table': ['csv', 'excel', 'json'],
  'map': ['png', 'geojson']
};
```

---

## 📋 Next Steps

1. **Component Development Priority**:
   - Executive Overview components (KPI, Donut, Bar)
   - Analytics charts (Multi-line, Heatmap, Forecast)
   - Geographic visualizations (Choropleth, Bubble map)
   - AI integration layer

2. **Data Pipeline Setup**:
   - Define SQL queries for each metric
   - Set up real-time data streams
   - Configure caching strategy

3. **AI Training Data**:
   - Collect interaction patterns
   - Build insight templates
   - Train Suqi on domain-specific queries

4. **Performance Optimization**:
   - Implement virtual scrolling for tables
   - Use WebGL for complex visualizations
   - Optimize drill-down queries

---

This blueprint provides a complete foundation for implementing the Scout Dashboard with full visualization specifications, interaction patterns, and AI integration points. Each chart is designed to support the specific insights needed while maintaining consistency with the Tableau-inspired extension architecture.