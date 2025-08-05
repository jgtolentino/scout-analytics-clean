/**
 * Dashboard Demo Page - Demonstrates the Tableau-style dashboard extension
 */

import React, { useState } from 'react';
import { DashboardExtension } from '../components/Dashboard';
import type { DashboardConfig } from '../components/Dashboard';

const DashboardDemoPage: React.FC = () => {
  const [savedConfig, setSavedConfig] = useState<DashboardConfig | null>(null);

  // Sample dashboard configuration
  const sampleConfig: DashboardConfig = {
    title: 'Sales Analytics Dashboard',
    description: 'Real-time sales performance metrics and insights',
    zones: [
      {
        id: 'zone-revenue',
        name: 'Total Revenue',
        type: 'kpi',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          value: 1245670,
          format: 'currency',
          change: 12.5,
          target: 1500000,
          sparklineData: [100000, 120000, 115000, 130000, 125000, 145000, 124567]
        }
      },
      {
        id: 'zone-orders',
        name: 'Orders',
        type: 'kpi',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          value: 3421,
          format: 'number',
          change: -2.3,
          sparklineData: [300, 320, 310, 350, 340, 330, 342]
        }
      },
      {
        id: 'zone-conversion',
        name: 'Conversion Rate',
        type: 'kpi',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          value: 0.0234,
          format: 'percentage',
          change: 5.7,
          target: 0.03
        }
      },
      {
        id: 'zone-revenue-chart',
        name: 'Revenue Trend',
        type: 'chart',
        position: { x: 0, y: 2, w: 6, h: 4 },
        config: {
          chartType: 'line',
          query: 'Show revenue trend for last 30 days'
        },
        dataSource: 'supabase'
      },
      {
        id: 'zone-category-breakdown',
        name: 'Sales by Category',
        type: 'chart',
        position: { x: 6, y: 2, w: 6, h: 4 },
        config: {
          chartType: 'pie',
          query: 'Show sales breakdown by product category'
        },
        dataSource: 'supabase'
      },
      {
        id: 'zone-filters',
        name: 'Dashboard Filters',
        type: 'filter',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          filters: [
            {
              id: 'date-filter',
              field: 'date',
              label: 'Date Range',
              type: 'date',
              operator: 'between'
            },
            {
              id: 'region-filter',
              field: 'region',
              label: 'Region',
              type: 'multiselect',
              options: [
                { value: 'north', label: 'North' },
                { value: 'south', label: 'South' },
                { value: 'east', label: 'East' },
                { value: 'west', label: 'West' }
              ]
            }
          ]
        }
      }
    ],
    parameters: [
      {
        id: 'param-date-range',
        name: 'dateRange',
        type: 'list',
        value: 'last30days',
        allowableValues: [
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' },
          { value: 'last7days', label: 'Last 7 Days' },
          { value: 'last30days', label: 'Last 30 Days' },
          { value: 'thisMonth', label: 'This Month' },
          { value: 'lastMonth', label: 'Last Month' }
        ]
      },
      {
        id: 'param-compare',
        name: 'enableComparison',
        type: 'boolean',
        value: false
      }
    ],
    filters: [
      {
        id: 'filter-status',
        field: 'status',
        operator: 'equals',
        value: 'active',
        applied: true
      }
    ],
    theme: {
      colorScheme: 'light',
      primaryColor: '#3B82F6',
      accentColor: '#10B981',
      fontFamily: 'system-ui'
    },
    layout: {
      type: 'grid',
      columns: 12,
      rows: 8,
      gap: 16
    }
  };

  const handleSave = (config: DashboardConfig) => {
    setSavedConfig(config);
    console.log('Dashboard saved:', config);
    // In a real app, this would save to a database
  };

  const handleExport = (format: string) => {
    console.log(`Exporting dashboard as ${format}`);
    // In a real app, this would trigger the export process
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-full">
        <DashboardExtension
          initialConfig={sampleConfig}
          onSave={handleSave}
          onExport={handleExport}
          readOnly={false}
        />
      </div>

      {savedConfig && (
        <div className="fixed bottom-4 left-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-3 rounded-lg shadow-lg">
          Dashboard configuration saved!
        </div>
      )}
    </div>
  );
};

export default DashboardDemoPage;