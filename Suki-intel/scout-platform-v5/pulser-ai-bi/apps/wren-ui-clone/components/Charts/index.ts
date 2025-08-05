/**
 * Chart Components Export
 * All visualization components for Scout Dashboard
 */

import React from 'react';
import { DonutChart } from './DonutChart';
import { HeatmapChart } from './HeatmapChart';

// Basic Charts
export { DonutChart } from './DonutChart';
export { HeatmapChart } from './HeatmapChart';

// Export chart types enum
export enum ChartType {
  // Single Metric
  KPI_CARD = 'kpi_card',
  GAUGE = 'gauge',
  
  // Comparison
  BAR = 'bar',
  COLUMN = 'column',
  HORIZONTAL_BAR = 'horizontal_bar',
  GROUPED_BAR = 'grouped_bar',
  STACKED_BAR = 'stacked_bar',
  
  // Part to Whole
  PIE = 'pie',
  DONUT = 'donut',
  TREEMAP = 'treemap',
  SUNBURST = 'sunburst',
  
  // Time Series
  LINE = 'line',
  MULTI_LINE = 'multi_line',
  AREA = 'area',
  SPARKLINE = 'sparkline',
  
  // Distribution
  HISTOGRAM = 'histogram',
  BOX_PLOT = 'box_plot',
  VIOLIN = 'violin',
  
  // Correlation
  SCATTER = 'scatter',
  BUBBLE = 'bubble',
  HEATMAP = 'heatmap',
  
  // Flow
  SANKEY = 'sankey',
  FUNNEL = 'funnel',
  WATERFALL = 'waterfall',
  
  // Geographic
  CHOROPLETH = 'choropleth',
  BUBBLE_MAP = 'bubble_map',
  HEAT_MAP = 'heat_map',
  
  // Specialized
  RADAR = 'radar',
  WORD_CLOUD = 'word_cloud',
  CALENDAR = 'calendar',
  TABLE = 'table'
}

// Chart capabilities interface
export interface ChartCapabilities {
  drillDown: boolean;
  export: boolean;
  aiInsights: boolean;
  realTimeUpdate: boolean;
  interactions: {
    hover: boolean;
    click: boolean;
    brush: boolean;
    zoom: boolean;
    pan: boolean;
  };
}

// Chart registry for dynamic loading
export const ChartRegistry = new Map<ChartType, {
  component: React.ComponentType<any>;
  capabilities: ChartCapabilities;
}>();

// Register available charts
ChartRegistry.set(ChartType.DONUT, {
  component: DonutChart,
  capabilities: {
    drillDown: true,
    export: true,
    aiInsights: true,
    realTimeUpdate: false,
    interactions: {
      hover: true,
      click: true,
      brush: false,
      zoom: false,
      pan: false
    }
  }
});

ChartRegistry.set(ChartType.HEATMAP, {
  component: HeatmapChart,
  capabilities: {
    drillDown: true,
    export: true,
    aiInsights: true,
    realTimeUpdate: true,
    interactions: {
      hover: true,
      click: true,
      brush: false,
      zoom: true,
      pan: false
    }
  }
});

// Chart selection helper
export function selectChartType(
  dataPattern: string,
  dataPoints: number,
  dimensions: number
): ChartType {
  // Implementation based on chart-type-suggestions.yaml rules
  if (dataPattern === 'part_to_whole' && dataPoints < 7) {
    return ChartType.DONUT;
  }
  if (dataPattern === 'cyclical_patterns') {
    return ChartType.HEATMAP;
  }
  if (dataPattern === 'single_trend_over_time') {
    return ChartType.LINE;
  }
  if (dataPattern === 'category_comparison') {
    return dataPoints > 5 ? ChartType.HORIZONTAL_BAR : ChartType.BAR;
  }
  // Default fallback
  return ChartType.BAR;
}