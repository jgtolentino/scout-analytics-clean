/**
 * Scout Runtime Demo - Demonstrates full Tableau-style API integration
 */

import React, { useEffect, useState } from 'react';
import { DashboardExtension } from '../components/Dashboard';
import { useScoutRuntime } from '../hooks/useScoutRuntime';
import { ScoutEventType } from '../lib/scoutEventBus';
import type { DashboardConfig } from '../components/Dashboard';

const ScoutRuntimeDemoPage: React.FC = () => {
  const [eventLog, setEventLog] = useState<string[]>([]);
  
  // Initialize Scout Runtime
  const {
    initialized,
    loading,
    error,
    dashboardName,
    zones,
    parameters,
    filters,
    environment,
    scout,
    emitEvent,
    onEvent,
    showToast,
    requestAIInsight,
    updateParameter,
    applyFilter
  } = useScoutRuntime({
    source: 'scout-runtime-demo',
    autoInitialize: true
  });

  // Sample dashboard configuration with Scout API integration
  const sampleConfig: DashboardConfig = {
    title: 'Scout Runtime Demo Dashboard',
    description: 'Demonstrates Tableau-style API capabilities',
    zones: [
      {
        id: 'zone-sales-kpi',
        name: 'Sales Performance',
        type: 'kpi',
        position: { x: 0, y: 0, w: 4, h: 2 },
        config: {
          value: 2456789,
          format: 'currency',
          change: 15.3,
          target: 3000000,
          query: 'SELECT SUM(amount) as total FROM sales WHERE date >= {{dateRange}}'
        },
        dataSource: 'supabase'
      },
      {
        id: 'zone-revenue-chart',
        name: 'Revenue Trend',
        type: 'chart',
        position: { x: 4, y: 0, w: 8, h: 4 },
        config: {
          chartType: 'line',
          query: 'Show me revenue trend for {{dateRange}} grouped by month'
        },
        dataSource: 'supabase'
      },
      {
        id: 'zone-filters',
        name: 'Dashboard Filters',
        type: 'filter',
        position: { x: 0, y: 2, w: 4, h: 4 },
        config: {
          filters: [
            {
              id: 'region-filter',
              field: 'region',
              label: 'Region',
              type: 'multiselect',
              options: [
                { value: 'north', label: 'North America' },
                { value: 'south', label: 'South America' },
                { value: 'europe', label: 'Europe' },
                { value: 'asia', label: 'Asia Pacific' }
              ]
            },
            {
              id: 'product-filter',
              field: 'product_category',
              label: 'Product Category',
              type: 'select',
              options: [
                { value: 'electronics', label: 'Electronics' },
                { value: 'software', label: 'Software' },
                { value: 'services', label: 'Services' }
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
          { value: 'last7days', label: 'Last 7 Days' },
          { value: 'last30days', label: 'Last 30 Days' },
          { value: 'last90days', label: 'Last 90 Days' },
          { value: 'ytd', label: 'Year to Date' }
        ],
        required: true
      },
      {
        id: 'param-comparison',
        name: 'enableComparison',
        type: 'boolean',
        value: true
      }
    ],
    filters: [],
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

  // Subscribe to Scout events
  useEffect(() => {
    if (!initialized) return;

    // Log all events for demo
    const logEvent = (type: string) => (data: any) => {
      const timestamp = new Date().toLocaleTimeString();
      setEventLog(prev => [`[${timestamp}] ${type}: ${JSON.stringify(data)}`, ...prev].slice(0, 20));
    };

    // Subscribe to various events
    const unsubscribers = [
      onEvent(ScoutEventType.ZONE_ADDED, logEvent('Zone Added')),
      onEvent(ScoutEventType.ZONE_UPDATED, logEvent('Zone Updated')),
      onEvent(ScoutEventType.FILTER_CHANGED, logEvent('Filter Changed')),
      onEvent(ScoutEventType.PARAMETER_CHANGED, logEvent('Parameter Changed')),
      onEvent(ScoutEventType.DATA_REQUESTED, logEvent('Data Requested')),
      onEvent(ScoutEventType.AI_INSIGHT_REQUESTED, logEvent('AI Insight Requested'))
    ];

    // Demonstrate Scout API capabilities
    showToast('Scout Runtime initialized successfully!', 'success');

    // Clean up
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [initialized, onEvent, showToast]);

  // Handle dashboard save with Scout API
  const handleSave = async (config: DashboardConfig) => {
    try {
      // Save using Scout settings API
      scout.settings.set('dashboard-config', JSON.stringify(config));
      await scout.settings.saveAsync();
      
      showToast('Dashboard saved successfully!', 'success');
      emitEvent(ScoutEventType.CONFIG_SAVED, { config });
    } catch (error) {
      showToast('Failed to save dashboard', 'error');
      emitEvent(ScoutEventType.DASHBOARD_ERROR, { error });
    }
  };

  // Handle export with Scout API
  const handleExport = async (format: string) => {
    emitEvent(ScoutEventType.EXPORT_STARTED, { format });
    
    try {
      // Simulate export process
      setTimeout(() => {
        showToast(`Dashboard exported as ${format}`, 'success');
        emitEvent(ScoutEventType.EXPORT_COMPLETED, { format });
      }, 1000);
    } catch (error) {
      emitEvent(ScoutEventType.EXPORT_FAILED, { format, error });
    }
  };

  // Demo AI insight request
  const demoAIInsight = async () => {
    const context = {
      zones: zones.map(z => ({ id: z.id, type: z.type })),
      filters: filters.filter(f => f.applied),
      parameters: parameters.map(p => ({ name: p.name, value: p.value }))
    };
    
    const insight = await requestAIInsight(context);
    showToast('AI Insight generated!', 'info');
  };

  // Demo parameter change
  const demoParameterChange = () => {
    const dateParam = parameters.find(p => p.name === 'dateRange');
    if (dateParam) {
      const newValue = dateParam.value === 'last30days' ? 'last7days' : 'last30days';
      updateParameter(dateParam.id, newValue);
    }
  };

  // Demo filter application
  const demoFilterApplication = () => {
    applyFilter('region-filter', ['north', 'europe']);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing Scout Runtime...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error initializing Scout Runtime:</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Scout API Demo Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold mb-4">Scout Runtime API Demo</h1>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Environment Info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Environment</h3>
              <div className="text-xs space-y-1">
                <p>Mode: {environment.mode}</p>
                <p>API Version: {environment.apiVersion}</p>
                <p>Theme: {environment.theme}</p>
                <p>Locale: {environment.locale}</p>
                <p>User: {environment.user?.email}</p>
              </div>
            </div>

            {/* API Demo Actions */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Scout API Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={demoAIInsight}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                >
                  Request AI Insight
                </button>
                <button
                  onClick={demoParameterChange}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Change Parameter
                </button>
                <button
                  onClick={demoFilterApplication}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Apply Filter
                </button>
                <button
                  onClick={() => scout.ui.displayDialogAsync('/config', { width: 800, height: 600 })}
                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                >
                  Open Dialog
                </button>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Event Log (Scout Event Bus)</h3>
            <div className="h-32 overflow-y-auto bg-black text-green-400 p-2 rounded text-xs font-mono">
              {eventLog.length === 0 ? (
                <p className="text-gray-500">No events yet...</p>
              ) : (
                eventLog.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard with Scout Runtime Integration */}
      <div className="flex-1">
        <DashboardExtension
          initialConfig={sampleConfig}
          onSave={handleSave}
          onExport={handleExport}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default ScoutRuntimeDemoPage;