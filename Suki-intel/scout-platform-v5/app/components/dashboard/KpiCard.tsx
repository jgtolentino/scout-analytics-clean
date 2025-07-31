'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface KpiCardProps {
  id: string;
  label?: string;
  config?: any;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary' | 'ghost';
    action?: string;
  }>;
  className?: string;
}

// Mock KPI data based on ID
const mockKpiData: Record<string, any> = {
  total_revenue: {
    value: 18459280,
    currency: 'PHP',
    trend: 12.5,
    icon: DollarSign,
    label: 'Total Revenue'
  },
  transaction_count: {
    value: 156789,
    trend: 8.3,
    icon: ShoppingCart,
    label: 'Total Transactions'
  },
  unique_customers: {
    value: 42156,
    trend: 15.2,
    icon: Users,
    label: 'Unique Customers'
  },
  average_basket_size: {
    value: 267.50,
    currency: 'PHP',
    trend: -2.1,
    icon: Package,
    label: 'Avg Basket Size'
  }
};

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  label,
  config,
  actions,
  className
}) => {
  const [loading, setLoading] = React.useState(true);
  const [kpiData, setKpiData] = React.useState<any>(null);

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      const data = mockKpiData[id] || {
        value: 0,
        trend: 0,
        label: label || 'KPI Metric'
      };
      setKpiData(data);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id, label]);

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!kpiData) return null;

  const Icon = kpiData.icon || DollarSign;
  const isPositiveTrend = kpiData.trend > 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  const formatValue = (value: number, currency?: string) => {
    if (currency) {
      return `${currency} ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString();
  };

  return (
    <Card className={`${className} hover:shadow-lg transition-shadow`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{kpiData.label || label}</h3>
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(kpiData.value, kpiData.currency)}
          </div>
          
          {kpiData.trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">
                {isPositiveTrend ? '+' : ''}{kpiData.trend}%
              </span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={() => console.log('Action:', action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
