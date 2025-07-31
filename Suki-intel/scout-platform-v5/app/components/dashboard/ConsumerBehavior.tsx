'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageSquare, CheckCircle, XCircle, HelpCircle, Filter, Download } from 'lucide-react';

interface ConsumerBehaviorProps {
  id: string;
  label?: string;
  config?: {
    data_source?: string;
    request_types?: string[];
    suggestion_analysis?: boolean;
    decision_flow?: boolean;
  };
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

export const ConsumerBehavior: React.FC<ConsumerBehaviorProps> = ({
  id,
  label = "Consumer Behavior & Preference Analysis",
  config,
  actions,
  className
}) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState('request_types');
  const [locationFilter, setLocationFilter] = React.useState('all');

  // Mock data for request types
  const requestTypeData = [
    { name: 'Branded Request', value: 1245, percentage: 52.3, color: '#3563E9' },
    { name: 'Unbranded Request', value: 867, percentage: 36.4, color: '#FFC300' },
    { name: 'Unsure/Asking', value: 268, percentage: 11.3, color: '#27AE60' }
  ];

  // Mock data for request methods
  const requestMethodData = [
    { method: 'Direct Ask', count: 890, acceptance_rate: 78.5 },
    { method: 'Point & Select', count: 654, acceptance_rate: 92.1 },
    { method: 'Brand Mention', count: 543, acceptance_rate: 85.7 },
    { method: 'Category Request', count: 433, acceptance_rate: 67.4 },
    { method: 'Price Inquiry', count: 289, acceptance_rate: 43.2 }
  ];

  // Mock data for suggestion acceptance
  const suggestionData = [
    { name: 'Accepted', value: 1456, percentage: 68.7, color: '#27AE60' },
    { name: 'Declined', value: 423, percentage: 20.0, color: '#EB5757' },
    { name: 'Considered', value: 239, percentage: 11.3, color: '#FFC300' }
  ];

  // Decision funnel data
  const decisionFunnelData = [
    { name: 'Store Entry', value: 2380, fill: '#3563E9' },
    { name: 'Product Interest', value: 1890, fill: '#5B73E8' },
    { name: 'Price Check', value: 1345, fill: '#8B9AE6' },
    { name: 'Staff Interaction', value: 987, fill: '#BBC2E5' },
    { name: 'Purchase Decision', value: 756, fill: '#E8EAED' }
  ];

  const locationOptions = [
    { key: 'all', label: 'All Barangays' },
    { key: 'urban', label: 'Urban Areas' },
    { key: 'suburban', label: 'Suburban Areas' },
    { key: 'rural', label: 'Rural Areas' }
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      switch (activeView) {
        case 'request_types':
          setData(requestTypeData);
          break;
        case 'request_methods':
          setData(requestMethodData);
          break;
        case 'suggestions':
          setData(suggestionData);
          break;
        default:
          setData(requestTypeData);
      }
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [activeView, locationFilter]);

  const viewOptions = [
    { key: 'request_types', label: 'Request Types', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'request_methods', label: 'Request Methods', icon: <HelpCircle className="w-4 h-4" /> },
    { key: 'suggestions', label: 'Suggestion Response', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'decision_flow', label: 'Decision Flow', icon: <Filter className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const renderChart = () => {
    switch (activeView) {
      case 'request_types':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={requestTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {requestTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Requests']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'request_methods':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestMethodData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="method" type="category" width={100} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'acceptance_rate' ? `${value}%` : Number(value).toLocaleString(),
                  name === 'acceptance_rate' ? 'Acceptance Rate' : 'Count'
                ]}
              />
              <Bar dataKey="count" fill="#3563E9" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'suggestions':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={suggestionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {suggestionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Responses']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'decision_flow':
        return (
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-full max-w-md">
              {decisionFunnelData.map((item, index) => {
                const widthPercent = (item.value / decisionFunnelData[0].value) * 100;
                return (
                  <div key={index} className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-8 bg-gray-200 rounded overflow-hidden">
                      <div 
                        className="h-full rounded transition-all duration-500"
                        style={{ 
                          width: `${widthPercent}%`,
                          backgroundColor: item.fill
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{label}</h3>
        </div>

        {/* View Toggle and Location Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-1">
            {viewOptions.map((option) => (
              <Button
                key={option.key}
                variant={activeView === option.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView(option.key)}
                className="flex items-center gap-1"
              >
                {option.icon}
                <span className="hidden md:inline">{option.label}</span>
              </Button>
            ))}
          </div>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {locationOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            {renderChart()}
          </div>

          {/* Insights Panel */}
          <div className="space-y-4">
            <h4 className="font-medium">Key Insights</h4>
            
            {activeView === 'request_types' && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Brand Loyalty</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    52% of customers ask for specific brands, indicating strong brand awareness
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <HelpCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Advisory Opportunity</span>
                  </div>
                  <div className="text-xs text-yellow-700">
                    36% make unbranded requests - opportunity for staff recommendations
                  </div>
                </div>
              </div>
            )}

            {activeView === 'request_methods' && (
              <div className="space-y-3">
                {requestMethodData.slice(0, 3).map((method, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">{method.method}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {method.acceptance_rate}% acceptance rate
                    </div>
                    <div className="text-xs text-gray-500">
                      {method.count.toLocaleString()} requests
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'suggestions' && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">High Acceptance</span>
                  </div>
                  <div className="text-xs text-green-700">
                    68.7% of suggestions are accepted by customers
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Improvement Area</span>
                  </div>
                  <div className="text-xs text-orange-700">
                    20% decline rate suggests room for better recommendations
                  </div>
                </div>
              </div>
            )}

            {activeView === 'decision_flow' && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Conversion Rate</div>
                  <div className="text-lg font-bold text-blue-900">31.8%</div>
                  <div className="text-xs text-blue-700">From entry to purchase</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm font-medium text-red-900">Biggest Drop-off</div>
                  <div className="text-lg font-bold text-red-900">Price Check</div>
                  <div className="text-xs text-red-700">28% abandon after price inquiry</div>
                </div>
              </div>
            )}

            {/* Behavioral Patterns */}
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium mb-2">Behavioral Patterns</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Repeat Visitors</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Ask for Alternatives</span>
                  <span className="font-medium">34%</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Conscious</span>
                  <span className="font-medium">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-6">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={() => console.log('Action:', action.action)}
                className="flex items-center gap-2"
              >
                {action.action?.includes('export') && <Download className="w-4 h-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConsumerBehavior;