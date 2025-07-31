'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricItem {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
}

interface MetricsRowProps {
  id: string;
  metrics: MetricItem[];
  className?: string;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({
  id,
  metrics,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${metrics.length} gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString() 
                  : metric.value}
              </p>
              {metric.trend !== undefined && (
                <div className="flex items-center mt-2">
                  {metric.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend > 0 ? '+' : ''}{metric.trend}%
                  </span>
                </div>
              )}
            </div>
            {metric.icon && (
              <div className="ml-4">
                {metric.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsRow;