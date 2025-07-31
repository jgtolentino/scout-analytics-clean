'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Clock, MapPin, Filter, Download, Eye } from 'lucide-react';

interface TransactionTrendsProps {
  id: string;
  label?: string;
  config?: {
    data_source?: string;
    time_period?: string;
    toggles?: {
      time_of_day?: boolean;
      location?: boolean;
      category?: boolean;
      weekend_filter?: boolean;
    };
    visualizations?: string[];
  };
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

export const TransactionTrends: React.FC<TransactionTrendsProps> = ({
  id,
  label = "Transaction Trends Analysis",
  config,
  actions,
  className
}) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeToggle, setActiveToggle] = React.useState('volume');
  const [timeFilter, setTimeFilter] = React.useState('all_day');
  const [locationFilter, setLocationFilter] = React.useState('all_regions');
  const [chartType, setChartType] = React.useState('line');

  // Mock data for demonstration
  const mockData = [
    { hour: '06:00', volume: 45, value: 2340.50, units: 89, region: 'NCR' },
    { hour: '08:00', volume: 120, value: 6780.25, units: 245, region: 'NCR' },
    { hour: '10:00', volume: 180, value: 9450.75, units: 367, region: 'NCR' },
    { hour: '12:00', volume: 220, value: 12890.30, units: 445, region: 'NCR' },
    { hour: '14:00', volume: 195, value: 10250.60, units: 398, region: 'NCR' },
    { hour: '16:00', volume: 240, value: 14560.80, units: 489, region: 'NCR' },
    { hour: '18:00', volume: 280, value: 18750.40, units: 567, region: 'NCR' },
    { hour: '20:00', volume: 160, value: 8940.20, units: 325, region: 'NCR' }
  ];

  React.useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeFilter, locationFilter]);

  const toggleOptions = [
    { key: 'volume', label: 'Transaction Volume', icon: <BarChart className="w-4 h-4" /> },
    { key: 'value', label: 'Peso Value', icon: <LineChart className="w-4 h-4" /> },
    { key: 'units', label: 'Units per Transaction', icon: <BarChart className="w-4 h-4" /> }
  ];

  const timeOptions = [
    { key: 'all_day', label: 'All Day' },
    { key: 'morning', label: 'Morning (6-12)' },
    { key: 'afternoon', label: 'Afternoon (12-18)' },
    { key: 'evening', label: 'Evening (18-24)' }
  ];

  const locationOptions = [
    { key: 'all_regions', label: 'All Regions' },
    { key: 'ncr', label: 'NCR' },
    { key: 'region_3', label: 'Region III' },
    { key: 'region_4a', label: 'Region IV-A' }
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

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{label}</h3>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line Chart
            </Button>
            <Button
              variant={chartType === 'heatmap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('heatmap')}
            >
              Heatmap
            </Button>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Metric Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Metric</label>
            <div className="flex gap-1">
              {toggleOptions.map((option) => (
                <Button
                  key={option.key}
                  variant={activeToggle === option.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveToggle(option.key)}
                  className="flex items-center gap-1"
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Time of Day
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locationOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    typeof value === 'number' ? 
                      (name === 'value' ? `₱${value.toFixed(2)}` : value.toLocaleString()) 
                      : value,
                    name === 'volume' ? 'Transactions' : 
                    name === 'value' ? 'Revenue' : 'Units'
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={activeToggle}
                  stroke="#3563E9"
                  strokeWidth={2}
                  dot={{ fill: '#3563E9', strokeWidth: 2, r: 4 }}
                  name={toggleOptions.find(opt => opt.key === activeToggle)?.label}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey={activeToggle}
                  fill="#3563E9"
                  name={toggleOptions.find(opt => opt.key === activeToggle)?.label}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Insights Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Peak Hours</div>
            <div className="text-lg font-bold text-blue-900">6-8 PM</div>
            <div className="text-xs text-blue-500">Highest transaction volume</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Avg Transaction</div>
            <div className="text-lg font-bold text-green-900">₱52.30</div>
            <div className="text-xs text-green-500">+12% vs last period</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Total Volume</div>
            <div className="text-lg font-bold text-yellow-900">1,440</div>
            <div className="text-xs text-yellow-500">Transactions today</div>
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
                {action.action === 'export_csv' && <Download className="w-4 h-4" />}
                {action.action === 'drill_down' && <Eye className="w-4 h-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionTrends;