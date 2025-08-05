/**
 * Scout Dashboard Demo
 * Demonstrates full Tableau Extensions API parity with enhancements
 */

import React, { useEffect, useState } from 'react';
import { scout } from '../lib/scout-runtime';
import { 
  ScoutEventType, 
  getGlobalEventBus,
  FilterChangedEvent,
  ParameterChangedEvent,
  AIInsightEvent
} from '../lib/scout-runtime/events';

export default function ScoutDemoPage() {
  const [initialized, setInitialized] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [parameters, setParameters] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeScout();
  }, []);

  async function initializeScout() {
    try {
      // Initialize Scout Runtime (mirrors tableau.extensions.initializeAsync)
      await scout.initializeAsync({
        configure: () => {
          console.log('Configure context menu clicked');
          showConfigDialog();
        }
      });

      setInitialized(true);

      // Access dashboard content
      if (scout.dashboardContent) {
        const dashboard = scout.dashboardContent.dashboard;
        setDashboardName(dashboard.name);

        // Get parameters and filters
        const params = await dashboard.getParametersAsync();
        setParameters(params);

        const allFilters = await dashboard.getFiltersAsync();
        setFilters(allFilters);
      }

      // Set up event listeners
      setupEventListeners();

      // Request initial AI insight
      requestAIInsight();

    } catch (err) {
      console.error('Failed to initialize Scout:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  function setupEventListeners() {
    const eventBus = getGlobalEventBus();

    // Listen for filter changes
    eventBus.on(ScoutEventType.FILTER_CHANGED, (event: any) => {
      const filterEvent = event.data as FilterChangedEvent;
      console.log('Filter changed:', filterEvent);
      updateFilters();
    });

    // Listen for parameter changes
    eventBus.on(ScoutEventType.PARAMETER_CHANGED, (event: any) => {
      const paramEvent = event.data as ParameterChangedEvent;
      console.log('Parameter changed:', paramEvent);
      updateParameters();
    });

    // Listen for AI insights
    eventBus.on(ScoutEventType.AI_INSIGHT_GENERATED, (event: any) => {
      const insightEvent = event.data as AIInsightEvent;
      console.log('AI insight generated:', insightEvent);
      setInsights(prev => [...prev, insightEvent.insight]);
    });
  }

  async function updateParameters() {
    if (scout.dashboardContent) {
      const params = await scout.dashboardContent.dashboard.getParametersAsync();
      setParameters(params);
    }
  }

  async function updateFilters() {
    if (scout.dashboardContent) {
      const allFilters = await scout.dashboardContent.dashboard.getFiltersAsync();
      setFilters(allFilters);
    }
  }

  async function requestAIInsight() {
    const context = {
      filters: filters.reduce((acc, f) => {
        acc[f.fieldName] = f.appliedValues?.map(v => v.value) || [];
        return acc;
      }, {} as any),
      parameters: parameters.reduce((acc, p) => {
        acc[p.name] = p.currentValue.value;
        return acc;
      }, {} as any)
    };

    await scout.requestAIInsight(context);
  }

  async function showConfigDialog() {
    const result = await scout.ui.displayDialogAsync(
      '/dialog/configure',
      JSON.stringify({ currentSettings: scout.settings.getAll() }),
      { width: 600, height: 400, style: 'modal' }
    );

    if (result) {
      console.log('Dialog result:', result);
    }
  }

  async function createVizImage() {
    const spec = {
      description: 'Sample bar chart',
      data: {
        values: [
          { Category: 'A', Measure: 28 },
          { Category: 'B', Measure: 55 },
          { Category: 'C', Measure: 43 }
        ]
      },
      mark: 'bar' as any,
      encoding: {
        columns: { field: 'Category', type: 'discrete' },
        rows: { field: 'Measure', type: 'continuous' }
      }
    };

    const svg = await scout.createVizImageAsync(spec);
    
    // Display SVG
    const container = document.getElementById('viz-container');
    if (container) {
      container.innerHTML = svg;
    }
  }

  async function exportDashboard(format: 'pdf' | 'png' | 'xlsx' | 'pptx') {
    try {
      const blob = await scout.exportDashboard(format);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      scout.ui.showToast({
        message: `Dashboard exported as ${format.toUpperCase()}`,
        type: 'success'
      });
    } catch (error) {
      scout.ui.showToast({
        message: `Export failed: ${error}`,
        type: 'error'
      });
    }
  }

  async function enableCollaboration() {
    try {
      await scout.enableCollaboration({
        userName: 'Demo User',
        role: 'editor'
      });
      
      scout.ui.showToast({
        message: 'Collaboration enabled',
        type: 'success'
      });
    } catch (error) {
      scout.ui.showToast({
        message: `Failed to enable collaboration: ${error}`,
        type: 'error'
      });
    }
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Scout Runtime...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Scout Dashboard Demo</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Dashboard: {dashboardName}</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Environment</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex">
                <dt className="font-medium w-32">API Version:</dt>
                <dd>{scout.environment.apiVersion}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Mode:</dt>
                <dd>{scout.environment.mode}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">Theme:</dt>
                <dd>{scout.environment.theme}</dd>
              </div>
              <div className="flex">
                <dt className="font-medium w-32">User:</dt>
                <dd>{scout.environment.user?.name}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={showConfigDialog}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Configure Extension
              </button>
              
              <button
                onClick={createVizImage}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
              >
                Create Viz Image
              </button>
              
              <button
                onClick={() => enableCollaboration()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ml-2"
              >
                Enable Collaboration
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Parameters</h3>
          <ul className="space-y-2">
            {parameters.map(param => (
              <li key={param.id} className="text-sm">
                <span className="font-medium">{param.name}:</span>{' '}
                <span className="text-gray-600">{param.currentValue.formattedValue}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Active Filters</h3>
          <ul className="space-y-2">
            {filters.map((filter, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{filter.fieldName}:</span>{' '}
                <span className="text-gray-600">
                  {filter.appliedValues?.map(v => v.formattedValue).join(', ') || 'All'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">AI Insights</h3>
          <ul className="space-y-2">
            {insights.slice(-3).map((insight, i) => (
              <li key={i} className="text-sm">
                <div className="font-medium">{insight.title}</div>
                <div className="text-gray-600 text-xs">{insight.description}</div>
              </li>
            ))}
          </ul>
          <button
            onClick={requestAIInsight}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Request New Insight
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Visualization Output</h3>
        <div id="viz-container" className="flex justify-center items-center h-64 bg-gray-50 rounded">
          <p className="text-gray-400">Click "Create Viz Image" to generate a visualization</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-3">Export Options</h3>
        <div className="flex gap-3">
          <button
            onClick={() => exportDashboard('pdf')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Export as PDF
          </button>
          <button
            onClick={() => exportDashboard('png')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Export as PNG
          </button>
          <button
            onClick={() => exportDashboard('xlsx')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Export as Excel
          </button>
          <button
            onClick={() => exportDashboard('pptx')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Export as PowerPoint
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Scout Runtime v{scout.environment.apiVersion} - Full Tableau Extensions API Parity</p>
        <p className="mt-1">Dashboard Object ID: {scout.dashboardObjectId}</p>
      </div>
    </div>
  );
}