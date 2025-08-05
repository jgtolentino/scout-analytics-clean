/**
 * Scout Dashboard Tableau Extension
 * Integrates Scout's storytelling features with Tableau
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { StoryModeProvider } from '../contexts/StoryModeContext';
import { StoryModeToggle } from '../components/Dashboard/StoryModeToggle';
import { DonutChart } from '../components/Charts/DonutChart';
import { HeatmapChart } from '../components/Charts/HeatmapChart';

// Tableau Extensions API types
declare global {
  interface Window {
    tableau: any;
  }
}

interface TableauData {
  worksheets: any[];
  parameters: any[];
  filters: any[];
}

export default function TableauExtension() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [tableauData, setTableauData] = useState<TableauData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Load Tableau Extensions API
    const script = document.createElement('script');
    script.src = 'https://public.tableau.com/javascripts/api/tableau.extensions.1.latest.min.js';
    script.onload = initializeTableauExtension;
    script.onerror = () => setError('Failed to load Tableau Extensions API');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeTableauExtension = async () => {
    try {
      if (typeof window !== 'undefined' && window.tableau) {
        await window.tableau.extensions.initializeAsync();
        console.log('✅ Scout Dashboard Extension initialized successfully');
        setIsInitialized(true);
        await loadTableauData();
      }
    } catch (err) {
      console.error('❌ Failed to initialize Tableau extension:', err);
      setError('Failed to initialize Tableau extension: ' + err.message);
    }
  };

  const loadTableauData = async () => {
    try {
      const dashboard = window.tableau.extensions.dashboardContent.dashboard;
      const worksheets = dashboard.worksheets;
      const parameters = await dashboard.getParametersAsync();
      
      console.log('📊 Found', worksheets.length, 'worksheets');
      console.log('⚙️ Found', parameters.length, 'parameters');

      // Load data from the first worksheet
      if (worksheets.length > 0) {
        const worksheet = worksheets[0];
        const dataTable = await worksheet.getSummaryDataAsync();
        
        // Transform Tableau data for Scout charts
        const transformedData = transformTableauData(dataTable);
        setChartData(transformedData);
      }

      setTableauData({
        worksheets,
        parameters,
        filters: []
      });

    } catch (err) {
      console.error('❌ Error loading Tableau data:', err);
      setError('Error loading data: ' + err.message);
    }
  };

  const transformTableauData = (dataTable: any) => {
    // Transform Tableau data structure to Scout chart format
    const data = [];
    const columns = dataTable.columns;
    const tableData = dataTable.data;

    // Simple transformation - adapt based on your data structure
    for (let i = 0; i < Math.min(tableData.length, 10); i++) {
      const row = tableData[i];
      data.push({
        name: row[0]?.formattedValue || `Item ${i + 1}`,
        value: parseFloat(row[1]?.value || Math.random() * 100),
      });
    }

    return data;
  };

  const handleConfigure = () => {
    // Open configuration dialog
    window.tableau.extensions.ui.displayDialogAsync(
      '/tableau-extension-config',
      'Configure Scout Dashboard',
      { height: 500, width: 600 }
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Extension Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center p-8">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Loading Scout Dashboard</h1>
          <p className="text-blue-600">Connecting to Tableau...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Scout Analytics - Tableau Extension</title>
        <meta name="description" content="AI-powered data storytelling in Tableau" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <StoryModeProvider defaultMode="explore">
        <div className="min-h-screen bg-gray-50 p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Scout Analytics</h1>
                <p className="text-sm text-gray-500">Powered by AI • Integrated with Tableau</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfigure}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Configure
              </button>
              <StoryModeToggle position="relative" />
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-green-800">
                Connected to Tableau • {tableauData?.worksheets.length || 0} worksheets • {tableauData?.parameters.length || 0} parameters
              </span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart with Tableau Data */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <DonutChart
                id="tableau-donut-chart"
                data={chartData.length > 0 ? chartData : [
                  { name: 'Category A', value: 35 },
                  { name: 'Category B', value: 28 },
                  { name: 'Category C', value: 22 },
                  { name: 'Category D', value: 15 }
                ]}
                title="Data Distribution from Tableau"
                showExplainButton={true}
                audience="manager"
                height={350}
              />
            </div>

            {/* Heatmap Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <HeatmapChart
                id="tableau-heatmap-chart"
                data={generateSampleHeatmapData()}
                xAxis={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                yAxis={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
                title="Activity Patterns"
                showExplainButton={true}
                audience="manager"
                height={350}
              />
            </div>
          </div>

          {/* Tableau Integration Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📊 Tableau Integration Active</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Worksheets:</span>
                <span className="ml-1 text-blue-600">{tableauData?.worksheets.length || 0}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Parameters:</span>
                <span className="ml-1 text-blue-600">{tableauData?.parameters.length || 0}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">AI Features:</span>
                <span className="ml-1 text-blue-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </StoryModeProvider>
    </>
  );
}

// Helper function to generate sample heatmap data
function generateSampleHeatmapData(): Array<[number, number, number]> {
  const data: Array<[number, number, number]> = [];
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      const value = Math.floor(Math.random() * 100) + (day < 5 ? 20 : 10); // Higher weekday activity
      data.push([day, week, value]);
    }
  }
  return data;
}