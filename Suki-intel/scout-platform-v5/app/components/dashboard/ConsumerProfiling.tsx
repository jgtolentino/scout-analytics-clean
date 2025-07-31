'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Treemap, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, MapPin, Filter, Download, UserCircle, UserCircle2, Clock } from 'lucide-react';

interface ConsumerProfilingProps {
  id: string;
  label?: string;
  config?: {
    data_source?: string;
    demographic_breakdown?: boolean;
    geographic_analysis?: boolean;
    age_segmentation?: boolean;
  };
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

export const ConsumerProfiling: React.FC<ConsumerProfilingProps> = ({
  id,
  label = "Consumer Profiling & Demographics",
  config,
  actions,
  className
}) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState('gender');
  const [locationFilter, setLocationFilter] = React.useState('all');

  // Mock data for gender distribution
  const genderData = [
    { name: 'Female', value: 1567, percentage: 62.3, color: '#E91E63', age_avg: 34.2 },
    { name: 'Male', value: 947, percentage: 37.7, color: '#2196F3', age_avg: 31.8 }
  ];

  // Mock data for age groups
  const ageGroupData = [
    { name: '18-25', value: 423, percentage: 16.8, color: '#4CAF50', spending_avg: 45.30 },
    { name: '26-35', value: 856, percentage: 34.1, color: '#2196F3', spending_avg: 67.80 },
    { name: '36-45', value: 734, percentage: 29.2, color: '#FF9800', spending_avg: 89.40 },
    { name: '46-55', value: 398, percentage: 15.8, color: '#E91E63', spending_avg: 72.60 },
    { name: '56+', value: 103, percentage: 4.1, color: '#9C27B0', spending_avg: 56.20 }
  ];

  // Mock data for location mapping
  const locationData = [
    { barangay: 'Barangay 1', customers: 234, revenue: 12450, lat: 14.5995, lng: 120.9842 },
    { barangay: 'Barangay 2', customers: 189, revenue: 9870, lat: 14.6042, lng: 120.9822 },
    { barangay: 'Barangay 3', customers: 156, revenue: 8340, lat: 14.6018, lng: 120.9888 },
    { barangay: 'Barangay 4', customers: 267, revenue: 15670, lat: 14.5967, lng: 120.9901 },
    { barangay: 'Barangay 5', customers: 198, revenue: 11230, lat: 14.6089, lng: 120.9765 }
  ];

  // Mock data for demographic tree
  const demographicTreeData = [
    { name: 'Female 26-35 Urban', size: 456, category: 'High Value', spending: 89.50 },
    { name: 'Male 36-45 Urban', size: 234, category: 'High Value', spending: 76.30 },
    { name: 'Female 18-25 Suburban', size: 189, category: 'Growth', spending: 45.20 },
    { name: 'Male 26-35 Urban', size: 167, category: 'Growth', spending: 52.80 },
    { name: 'Female 46+ Rural', size: 123, category: 'Stable', spending: 38.90 },
    { name: 'Male 18-25 Suburban', size: 98, category: 'Emerging', spending: 31.40 }
  ];

  const locationOptions = [
    { key: 'all', label: 'All Areas' },
    { key: 'urban', label: 'Urban' },
    { key: 'suburban', label: 'Suburban' },
    { key: 'rural', label: 'Rural' }
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      switch (activeView) {
        case 'gender':
          setData(genderData);
          break;
        case 'age':
          setData(ageGroupData);
          break;
        case 'location':
          setData(locationData);
          break;
        case 'demographic_tree':
          setData(demographicTreeData);
          break;
        default:
          setData(genderData);
      }
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [activeView, locationFilter]);

  const viewOptions = [
    { key: 'gender', label: 'Gender', icon: <Users className="w-4 h-4" /> },
    { key: 'age', label: 'Age Groups', icon: <Clock className="w-4 h-4" /> },
    { key: 'location', label: 'Geographic', icon: <MapPin className="w-4 h-4" /> },
    { key: 'demographic_tree', label: 'Segments', icon: <Filter className="w-4 h-4" /> }
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
      case 'gender':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  Number(value).toLocaleString(),
                  `Customers (Avg Age: ${props.payload.age_avg})`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'age':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageGroupData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {ageGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  Number(value).toLocaleString(),
                  `Customers (Avg Spend: ₱${props.payload.spending_avg})`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'location':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="customers" name="Customers" />
              <YAxis dataKey="revenue" name="Revenue" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₱${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                  name === 'revenue' ? 'Revenue' : 'Customers'
                ]}
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload;
                  return data ? `${data.barangay}` : '';
                }}
              />
              <Scatter dataKey="revenue" fill="#3563E9" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'demographic_tree':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={demographicTreeData}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#3563E9"
            >
              <Tooltip 
                formatter={(value: any) => [
                  Number(value).toLocaleString(),
                  'Customers'
                ]}
              />
            </Treemap>
          </ResponsiveContainer>
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

          {/* Demographics Summary */}
          <div className="space-y-4">
            <h4 className="font-medium">Profile Summary</h4>
            
            {activeView === 'gender' && (
              <div className="space-y-3">
                {genderData.map((gender, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {gender.name === 'Female' ? (
                        <UserCircle2 className="w-4 h-4 text-pink-600" />
                      ) : (
                        <UserCircle className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="font-medium">{gender.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{gender.value.toLocaleString()} customers ({gender.percentage}%)</div>
                      <div>Avg Age: {gender.age_avg} years</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'age' && (
              <div className="space-y-3">
                {ageGroupData.slice(0, 3).map((age, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{age.name} years</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>{age.value.toLocaleString()} customers</div>
                      <div>Avg Spend: ₱{age.spending_avg}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'location' && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Top Locations</h5>
                {locationData.slice(0, 3).map((location, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{location.barangay}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>{location.customers} customers</div>
                      <div>₱{location.revenue.toLocaleString()} revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'demographic_tree' && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Key Segments</h5>
                {demographicTreeData.slice(0, 3).map((segment, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">{segment.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <div>{segment.size} customers</div>
                      <div>₱{segment.spending} avg spend</div>
                      <div className="text-xs font-medium text-blue-600">{segment.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Insights */}
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium mb-2">Key Insights</h5>
              <div className="space-y-2 text-xs">
                {activeView === 'gender' && (
                  <>
                    <div className="flex justify-between">
                      <span>Female Dominance</span>
                      <span className="font-medium">62.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Higher Female Spend</span>
                      <span className="font-medium">+23%</span>
                    </div>
                  </>
                )}
                {activeView === 'age' && (
                  <>
                    <div className="flex justify-between">
                      <span>Prime Segment</span>
                      <span className="font-medium">26-45 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Highest Spenders</span>
                      <span className="font-medium">36-45 group</span>
                    </div>
                  </>
                )}
                {activeView === 'location' && (
                  <>
                    <div className="flex justify-between">
                      <span>Coverage</span>
                      <span className="font-medium">15 barangays</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Urban Concentration</span>
                      <span className="font-medium">67%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Demographic Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-900">2,514</div>
                <div className="text-xs text-blue-600">Total Customers</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-900">₱62.40</div>
                <div className="text-xs text-green-600">Avg Spend</div>
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

export default ConsumerProfiling;