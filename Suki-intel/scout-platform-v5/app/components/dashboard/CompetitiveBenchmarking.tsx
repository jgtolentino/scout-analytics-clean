'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CompetitiveBenchmarkingProps {
  id: string;
  label?: string;
  config?: {
    data_source?: string;
    competitors?: string[];
    metrics?: string[];
  };
  className?: string;
}

export const CompetitiveBenchmarking: React.FC<CompetitiveBenchmarkingProps> = ({
  id,
  label = "Competitive Benchmarking Analysis",
  config,
  className
}) => {
  // Mock data for competitive analysis
  const radarData = [
    { metric: 'Market Share', yourBrand: 45, competitor1: 35, competitor2: 20 },
    { metric: 'Brand Awareness', yourBrand: 78, competitor1: 82, competitor2: 65 },
    { metric: 'Customer Satisfaction', yourBrand: 88, competitor1: 75, competitor2: 80 },
    { metric: 'Price Competitiveness', yourBrand: 72, competitor1: 85, competitor2: 90 },
    { metric: 'Product Quality', yourBrand: 92, competitor1: 85, competitor2: 78 },
    { metric: 'Distribution', yourBrand: 68, competitor1: 90, competitor2: 75 },
  ];

  const marketShareData = [
    { brand: 'Your Brand', share: 34.5, change: 2.3 },
    { brand: 'Competitor A', share: 28.2, change: -1.2 },
    { brand: 'Competitor B', share: 19.8, change: 0.5 },
    { brand: 'Others', share: 17.5, change: -1.6 },
  ];

  const performanceMetrics = [
    { metric: 'Revenue Growth', yourBrand: 12.5, industry: 8.2, status: 'above' },
    { metric: 'Customer Retention', yourBrand: 85, industry: 78, status: 'above' },
    { metric: 'Market Penetration', yourBrand: 42, industry: 45, status: 'below' },
    { metric: 'Innovation Index', yourBrand: 7.8, industry: 6.5, status: 'above' },
  ];

  const competitorMoves = [
    { competitor: 'Competitor A', action: 'Launched new product line', impact: 'high', date: '2 days ago' },
    { competitor: 'Competitor B', action: 'Price reduction campaign', impact: 'medium', date: '1 week ago' },
    { competitor: 'Competitor A', action: 'Expanded to 3 new regions', impact: 'high', date: '2 weeks ago' },
  ];

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">{label}</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Competitive Positioning</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Your Brand" dataKey="yourBrand" stroke="#3563E9" fill="#3563E9" fillOpacity={0.6} />
                <Radar name="Competitor A" dataKey="competitor1" stroke="#FFC300" fill="#FFC300" fillOpacity={0.6} />
                <Radar name="Competitor B" dataKey="competitor2" stroke="#27AE60" fill="#27AE60" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Market Share */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Market Share Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketShareData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 40]} />
                <YAxis dataKey="brand" type="category" />
                <Tooltip />
                <Bar dataKey="share" fill="#3563E9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance vs Industry */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Performance vs Industry Average</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">{metric.metric}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold">
                    {metric.yourBrand}{typeof metric.yourBrand === 'number' && metric.yourBrand < 50 ? '%' : ''}
                  </span>
                  <div className={`flex items-center ${
                    metric.status === 'above' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.status === 'above' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Industry avg: {metric.industry}{typeof metric.industry === 'number' && metric.industry < 50 ? '%' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Market Share Changes */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Market Share Changes (YoY)</h4>
          <div className="space-y-2">
            {marketShareData.map((brand, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{brand.brand}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(brand.share / 40) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{brand.share}%</span>
                  <span className={`text-sm flex items-center gap-1 ${
                    brand.change > 0 ? 'text-green-600' : brand.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {brand.change > 0 ? <TrendingUp className="h-3 w-3" /> : 
                     brand.change < 0 ? <TrendingDown className="h-3 w-3" /> : 
                     <Minus className="h-3 w-3" />}
                    {Math.abs(brand.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Moves */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Competitor Activities</h4>
          <div className="space-y-2">
            {competitorMoves.map((move, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  move.impact === 'high' ? 'bg-red-500' : 
                  move.impact === 'medium' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{move.competitor}</p>
                    <span className="text-xs text-gray-500">{move.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{move.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CompetitiveBenchmarking;