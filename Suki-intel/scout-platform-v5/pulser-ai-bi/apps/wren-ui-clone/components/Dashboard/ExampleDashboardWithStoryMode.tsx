/**
 * Example Dashboard with Story Mode Integration
 * Demonstrates how to use the new storytelling features
 */

import React from 'react';
import { StoryModeProvider } from '../../contexts/StoryModeContext';
import { StoryModeToggle } from './StoryModeToggle';
import { DonutChart } from '../Charts/DonutChart';
import { HeatmapChart } from '../Charts/HeatmapChart';
import { useStoryModeVisibility } from '../../contexts/StoryModeContext';

// Example data for donut chart
const revenueByRegion = [
  { name: 'North America', value: 4500000 },
  { name: 'Europe', value: 3200000 },
  { name: 'Asia Pacific', value: 2800000 },
  { name: 'Latin America', value: 1200000 },
  { name: 'Middle East', value: 800000 }
];

// Example data for heatmap
const generateHeatmapData = () => {
  const data: Array<[number, number, number]> = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      const value = Math.floor(Math.random() * 100) + (hour >= 9 && hour <= 17 && day < 5 ? 50 : 0);
      data.push([hour, day, value]);
    }
  }
  return data;
};

const DashboardContent = () => {
  // Use story mode visibility for different sections
  const detailsVisibility = useStoryModeVisibility({
    showInFocus: false,
    showInExplore: true
  });

  const insightsVisibility = useStoryModeVisibility({
    showInFocus: true,
    showInExplore: false,
    emphasizeInFocus: true
  });

  return (
    <div className="p-6 space-y-6">
      {/* Story Mode Toggle in Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <StoryModeToggle position="relative" />
      </div>

      {/* Key Insights Section (Focus Mode Only) */}
      <div className={insightsVisibility.className}>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-900 mb-4">
            AI-Generated Key Insights
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <h3 className="font-medium">Revenue Growth Accelerating</h3>
                <p className="text-sm text-gray-600">
                  Q4 revenue up 23% YoY, exceeding targets by $1.2M
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="font-medium">Geographic Expansion Opportunity</h3>
                <p className="text-sm text-gray-600">
                  Asia Pacific showing 45% growth, consider increased investment
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-medium">Peak Activity Pattern Identified</h3>
                <p className="text-sm text-gray-600">
                  Weekday afternoons drive 65% of transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Region Donut Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <DonutChart
            id="revenue-by-region"
            data={revenueByRegion}
            title="Revenue Distribution by Region"
            centerLabel="$12.5M"
            showExplainButton={true}
            audience="executive"
            height={350}
          />
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <HeatmapChart
            id="activity-heatmap"
            data={generateHeatmapData()}
            xAxis={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
            yAxis={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
            title="Weekly Activity Patterns"
            showExplainButton={true}
            audience="executive"
            height={350}
          />
        </div>
      </div>

      {/* Detailed Analytics Section (Explore Mode Only) */}
      <div className={detailsVisibility.className}>
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detailed Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
              <p className="text-2xl font-bold">45,231</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
              <p className="text-2xl font-bold">$276.40</p>
              <p className="text-sm text-green-600">+8.3% from last month</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <p className="text-2xl font-bold">3.24%</p>
              <p className="text-sm text-red-600">-0.5% from last month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component wrapped with StoryModeProvider
export const ExampleDashboardWithStoryMode: React.FC = () => {
  const handleModeChange = (mode: 'focus' | 'explore') => {
    console.log('Story mode changed to:', mode);
    // You can add analytics tracking or other side effects here
  };

  return (
    <StoryModeProvider defaultMode="explore" onModeChange={handleModeChange}>
      <div className="min-h-screen bg-gray-100">
        <DashboardContent />
      </div>
    </StoryModeProvider>
  );
};

// Export a standalone example for testing
export const StandaloneExample: React.FC = () => {
  return (
    <StoryModeProvider>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Scout Dashboard Story Mode Demo</h1>
            <p className="text-gray-600 mb-6">
              Toggle between Focus and Explore modes to see how the dashboard adapts for different audiences
            </p>
            <div className="flex justify-center">
              <StoryModeToggle showTooltip={true} />
            </div>
          </div>

          {/* Sample Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Market Share Analysis</h2>
              <DonutChart
                id="market-share"
                data={[
                  { name: 'Product A', value: 35 },
                  { name: 'Product B', value: 28 },
                  { name: 'Product C', value: 22 },
                  { name: 'Others', value: 15 }
                ]}
                title="Q4 2024 Market Share"
                showExplainButton={true}
                audience="manager"
                height={300}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Sales Patterns</h2>
              <HeatmapChart
                id="sales-patterns"
                data={generateHeatmapData()}
                xAxis={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
                yAxis={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                title="Monthly Sales Heatmap"
                colorScheme="warm"
                showExplainButton={true}
                audience="analyst"
                height={300}
              />
            </div>
          </div>
        </div>
      </div>
    </StoryModeProvider>
  );
};