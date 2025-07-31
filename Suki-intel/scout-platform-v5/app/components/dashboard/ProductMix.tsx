'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Filter, Download, TrendingUp, ArrowRight } from 'lucide-react';

interface ProductMixProps {
  id: string;
  label?: string;
  config?: {
    data_source?: string;
    categories?: string[];
    brands?: string[];
    sku_analysis?: boolean;
    substitution_flow?: boolean;
  };
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

export const ProductMix: React.FC<ProductMixProps> = ({
  id,
  label = "Product Mix & SKU Analysis",
  config,
  actions,
  className
}) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewType, setViewType] = React.useState('category');
  const [analysisMode, setAnalysisMode] = React.useState('volume');

  // Mock data for demonstration
  const categoryData = [
    { name: 'Beverages', volume: 2340, revenue: 45600, percentage: 35.2, color: '#3563E9' },
    { name: 'Snacks', volume: 1890, revenue: 32100, percentage: 28.4, color: '#FFC300' },
    { name: 'Personal Care', volume: 1456, revenue: 28900, percentage: 21.9, color: '#27AE60' },
    { name: 'Household', volume: 980, revenue: 18700, percentage: 14.5, color: '#EB5757' }
  ];

  const topSKUData = [
    { sku: 'Coca-Cola 8oz', brand: 'Coca-Cola', category: 'Beverages', volume: 456, revenue: 9120, substitution_rate: 0.15 },
    { sku: 'Lucky Me Instant Noodles', brand: 'Monde Nissin', category: 'Food', volume: 389, revenue: 7780, substitution_rate: 0.22 },
    { sku: 'Safeguard Bar Soap', brand: 'P&G', category: 'Personal Care', volume: 234, revenue: 7020, substitution_rate: 0.08 },
    { sku: 'Kopiko Coffee', brand: 'Mayora', category: 'Beverages', volume: 298, revenue: 5960, substitution_rate: 0.18 },
    { sku: 'Palmolive Shampoo', brand: 'Colgate', category: 'Personal Care', volume: 167, revenue: 5010, substitution_rate: 0.12 }
  ];

  const substitutionFlow = [
    { from: 'Coca-Cola', to: 'Pepsi', flow: 45, reason: 'Price' },
    { from: 'Lucky Me', to: 'Pancit Canton', flow: 38, reason: 'Availability' },
    { from: 'Safeguard', to: 'Dove', flow: 22, reason: 'Preference' },
    { from: 'Kopiko', to: 'Nescafe', flow: 31, reason: 'Promotion' }
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setData(viewType === 'category' ? categoryData : topSKUData);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [viewType]);

  const viewOptions = [
    { key: 'category', label: 'By Category', icon: <Package className="w-4 h-4" /> },
    { key: 'brand', label: 'By Brand', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'sku', label: 'Top SKUs', icon: <Filter className="w-4 h-4" /> }
  ];

  const analysisOptions = [
    { key: 'volume', label: 'Volume' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'basket_size', label: 'Basket Impact' }
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
            {viewOptions.map((option) => (
              <Button
                key={option.key}
                variant={viewType === option.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType(option.key)}
                className="flex items-center gap-1"
              >
                {option.icon}
                <span className="hidden sm:inline">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Analysis Mode Toggle */}
        <div className="flex gap-2 mb-6">
          {analysisOptions.map((option) => (
            <Button
              key={option.key}
              variant={analysisMode === option.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAnalysisMode(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Chart */}
          <div className="space-y-4">
            {viewType === 'category' ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey={analysisMode === 'volume' ? 'volume' : 'revenue'}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [
                        analysisMode === 'revenue' ? `₱${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                        analysisMode === 'volume' ? 'Units' : 'Revenue'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSKUData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="sku" type="category" width={120} />
                    <Tooltip 
                      formatter={(value) => [
                        analysisMode === 'revenue' ? `₱${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                        analysisMode === 'volume' ? 'Units' : 'Revenue'
                      ]}
                    />
                    <Bar
                      dataKey={analysisMode === 'volume' ? 'volume' : 'revenue'}
                      fill="#3563E9"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category Breakdown Summary */}
            <div className="grid grid-cols-2 gap-2">
              {categoryData.slice(0, 4).map((category, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Substitution Analysis */}
          <div className="space-y-4">
            <h4 className="font-medium">Substitution Patterns</h4>
            <div className="space-y-3">
              {substitutionFlow.map((flow, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{flow.from}</div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="text-sm font-medium">{flow.to}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{flow.flow}%</div>
                    <div className="text-xs text-gray-500">{flow.reason}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Basket Size Analysis */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Basket Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-900">3.4</div>
                  <div className="text-sm text-blue-600">Avg Items/Basket</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-900">₱87.50</div>
                  <div className="text-sm text-green-600">Avg Basket Value</div>
                </div>
              </div>
            </div>

            {/* Top Combo Products */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Popular Combinations</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Coke + Chips</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Noodles + Egg</span>
                  <span className="font-medium">54%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Soap + Shampoo</span>
                  <span className="font-medium">43%</span>
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

export default ProductMix;