/**
 * Component Registry - Maps schema types to React components
 * This enables dynamic rendering based on dashboard schema
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load components for better performance
const componentMap: Record<string, ComponentType<any>> = {
  // Layout & Navigation
  'sidebar_navigation': dynamic(() => import('./SidebarNavigation')),
  'top_navigation': dynamic(() => import('./TopNavigation')),
  'tabs': dynamic(() => import('./Tabs')),
  
  // KPI & Metrics
  'kpi_card': dynamic(() => import('./KpiCard')),
  'metrics_row': dynamic(() => import('./MetricsRow')),
  'trend_delta_badges': dynamic(() => import('./TrendDeltaBadges')),
  'health_badges': dynamic(() => import('./HealthBadges')),
  
  // Charts & Visualizations
  'line_chart': dynamic(() => import('./LineChart')),
  'bar_chart': dynamic(() => import('./BarChart')),
  'pie_chart': dynamic(() => import('./PieChart')),
  'doughnut_chart': dynamic(() => import('./DoughnutChart')),
  'sentiment_analysis': dynamic(() => import('./SentimentAnalysis')),
  'geo_map': dynamic(() => import('./GeoMap')),
  'heatmap': dynamic(() => import('./Heatmap')),
  
  // Tables & Data
  'data_table': dynamic(() => import('./DataTable')),
  'transaction_analytics_table': dynamic(() => import('./TransactionAnalyticsTable')),
  'competitive_benchmark_table': dynamic(() => import('./CompetitiveBenchmarkTable')),
  'store_performance_table': dynamic(() => import('./StorePerformanceTable')),
  'brand_performance_table': dynamic(() => import('./BrandPerformanceTable')),
  'competitive_benchmark': dynamic(() => import('./CompetitiveBenchmark')),
  
  // AI & Insights
  'ai_insights_card': dynamic(() => import('./AiInsightsCard')),
  'insight_card': dynamic(() => import('./InsightCard')),
  'rag_chat': dynamic(() => import('./RagChat')),
  'rag_chat_assistant': dynamic(() => import('./RagChatAssistant')),
  'ai_recommendations': dynamic(() => import('./AiRecommendations')),
  
  // Filters & Controls
  'filter_bar': dynamic(() => import('./FilterBar')),
  'advanced_filters': dynamic(() => import('./AdvancedFilters')),
  'context_display': dynamic(() => import('./ContextDisplay')),
  
  // Export & Sharing
  'export_controls': dynamic(() => import('./ExportControls')),
  'share_controls': dynamic(() => import('./ShareControls')),
  
  // System & Health
  'system_alerts': dynamic(() => import('./SystemAlerts')),
  
  // Scout Dashboard Specific Components
  'transaction_trends': dynamic(() => import('./TransactionTrends')),
  'product_mix': dynamic(() => import('./ProductMix')),
  'consumer_behavior': dynamic(() => import('./ConsumerBehavior')),
  'consumer_profiling': dynamic(() => import('./ConsumerProfiling')),
  
  // Legacy/Specialized Components
  'mentions_engagement': dynamic(() => import('./MentionsEngagement')),
  'competitive_benchmarking': dynamic(() => import('./CompetitiveBenchmarking')),
};

export function getComponent(type: string): ComponentType<any> | null {
  return componentMap[type] || null;
}

export function hasComponent(type: string): boolean {
  return type in componentMap;
}

export function getMissingComponents(schema: any): string[] {
  const missing: string[] = [];
  
  schema.sections.forEach((section: any) => {
    if (section.components) {
      section.components.forEach((component: any) => {
        if (!hasComponent(component.type)) {
          missing.push(component.type);
        }
      });
    }
  });
  
  return [...new Set(missing)]; // Remove duplicates
}

// Component factory for dynamic rendering
export function createComponent(componentConfig: any) {
  const Component = getComponent(componentConfig.type);
  
  if (!Component) {
    console.warn(`Component type "${componentConfig.type}" not found in registry`);
    return null;
  }
  
  // Return the component for rendering (JSX should be used in the renderer, not here)
  return Component;
}