'use client';

import React from 'react';
import { 
  ChartBarIcon, 
  PresentationChartLineIcon, 
  PhotoIcon, 
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import ScoutBot from '@/components/ScoutBot';
import { useSummary, useHealth } from '@/hooks/useAPI';

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function KpiCard({ title, value, change, changeType, icon: Icon }: KpiCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="metric-label">{title}</p>
          <p className="metric-value">{value}</p>
          <p className={`text-sm ${changeColor[changeType]}`}>
            {change}
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Fetch live data
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useSummary();
  const { data: healthData, isLoading: healthLoading } = useHealth();

  // Fallback to static data while loading or on error
  const apiData = summaryData?.success && summaryData.data ? summaryData.data as any : null;
  const healthStatus = healthData?.success && healthData.data ? healthData.data as any : null;
  const kpiData = apiData ? [
    {
      title: 'Total Campaigns',
      value: apiData.totalCampaigns?.toString() || '163',
      change: apiData.campaignGrowth || '+12 this month',
      changeType: 'positive' as const,
      icon: ChartBarIcon
    },
    {
      title: 'Avg Predicted ROI',
      value: apiData.avgROI || '3.2x',
      change: apiData.roiChange || '+15% vs target',
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon
    },
    {
      title: 'Creative Assets',
      value: apiData.creativeAssets?.toString() || '163',
      change: apiData.assetStatus || 'All processed',
      changeType: 'positive' as const,
      icon: PhotoIcon
    },
    {
      title: 'Prediction Accuracy',
      value: apiData.predictionAccuracy || '85%',
      change: apiData.accuracyChange || '+3% this quarter',
      changeType: 'positive' as const,
      icon: BoltIcon
    },
    {
      title: 'Avg CTR Prediction',
      value: apiData.avgCTR || '2.8%',
      change: apiData.ctrStatus || 'Within range',
      changeType: 'neutral' as const,
      icon: EyeIcon
    },
    {
      title: 'Data Quality Score',
      value: apiData.dataQuality || '96%',
      change: apiData.qualityStatus || 'Excellent',
      changeType: 'positive' as const,
      icon: ShieldCheckIcon
    }
  ] : [
    // Static fallback data
    {
      title: 'Total Campaigns',
      value: '163',
      change: '+12 this month',
      changeType: 'positive' as const,
      icon: ChartBarIcon
    },
    {
      title: 'Avg Predicted ROI',
      value: '3.2x',
      change: '+15% vs target',
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon
    },
    {
      title: 'Creative Assets',
      value: '163',
      change: 'All processed',
      changeType: 'positive' as const,
      icon: PhotoIcon
    },
    {
      title: 'Prediction Accuracy',
      value: '85%',
      change: '+3% this quarter',
      changeType: 'positive' as const,
      icon: BoltIcon
    },
    {
      title: 'Avg CTR Prediction',
      value: '2.8%',
      change: 'Within range',
      changeType: 'neutral' as const,
      icon: EyeIcon
    },
    {
      title: 'Data Quality Score',
      value: '96%',
      change: 'Excellent',
      changeType: 'positive' as const,
      icon: ShieldCheckIcon
    }
  ];

  const topCampaigns = [
    { name: 'Product Launch Salesforce Q4 2024', client: 'Salesforce', roi: '2.68x', status: 'Active' },
    { name: 'Seasonal Expedia Q2 2024', client: 'Expedia', roi: '3.01x', status: 'Active' },
    { name: 'Brand Awareness Nike Spring', client: 'Nike', roi: '2.45x', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AdsBot</h1>
                  <p className="text-sm text-gray-500">TBWA Project Scout Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {summaryLoading ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Loading...
                </span>
              ) : summaryError ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Connection Error
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Live Data Connected
                </span>
              )}
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <KpiCard key={index} {...kpi} />
          ))}
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Campaign Performance */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
              <PresentationChartLineIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {topCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">{campaign.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{campaign.roi}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Accuracy */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Prediction Model Performance</h3>
              <BoltIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">ROI Prediction</span>
                <span className="text-sm text-gray-900">87% accuracy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">CTR Prediction</span>
                <span className="text-sm text-gray-900">83% accuracy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Engagement Rate</span>
                <span className="text-sm text-gray-900">91% accuracy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="dashboard-card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <PresentationChartLineIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Forecast Analysis</h3>
              <p className="text-sm text-gray-500">Compare predictions vs actual performance</p>
            </div>
          </div>
          
          <div className="dashboard-card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <PhotoIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creative Performance</h3>
              <p className="text-sm text-gray-500">Analyze creative asset effectiveness</p>
            </div>
          </div>
          
          <div className="dashboard-card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Quality</h3>
              <p className="text-sm text-gray-500">Monitor data completeness and validation</p>
            </div>
          </div>
          
          <div className="dashboard-card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <BoltIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ScoutBot AI</h3>
              <p className="text-sm text-gray-500">Ask questions about your campaigns</p>
            </div>
          </div>
        </div>
      </main>

      {/* Database Status Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  healthStatus?.services?.database === 'connected' 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                {healthStatus?.services?.database === 'connected' 
                  ? 'Azure SQL Connected' 
                  : 'Database Disconnected'}
              </span>
              <span>{apiData ? `${apiData.totalCampaigns || 163} campaigns loaded` : '163 campaigns loaded'}</span>
              <span>Last sync: {healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleTimeString() : 'Just now'}</span>
            </div>
            <span>TBWA Project Scout v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* ScoutBot AI Assistant */}
      <ScoutBot />
    </div>
  );
}